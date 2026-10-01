import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';

interface KYCData {
  status: 'pending' | 'verified' | 'rejected';
  idVerified: boolean;
  addressVerified: boolean;
  documents: {
    governmentId?: string;
    proofOfAddress?: string;
    additionalDocs?: string[];
  };
  verificationDate?: Date;
}

interface WalletData {
  address: string;
  isConnected: boolean;
  provider?: string;
  chainId?: number;
  balance?: string;
}

interface User {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
  preferences?: {
    assetCategories: string[];
    notifications: boolean;
    language: string;
  };
  kyc?: KYCData;
  wallet?: WalletData;
  roles: {
    isBuyer: boolean;
    isSeller: boolean;
  };
  stats: {
    buyerRating?: number;
    sellerRating?: number;
    totalPurchases: number;
    totalSales: number;
  };
  bankAccount?: {
    isVerified: boolean;
    last4: string;
    type: string;
  };
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  submitKYC: (documents: KYCData['documents']) => Promise<void>;
  updateKYCStatus: (status: KYCData['status']) => Promise<void>;
  toggleRole: (role: 'buyer' | 'seller', enabled: boolean) => Promise<void>;
  connectBankAccount: (accountDetails: any) => Promise<void>;
  initializeWalletListeners: () => void;
  clearError: () => void; // Added clearError to the interface
}

const mockUsers = [
  {
    id: '1',
    email: 'demo@example.com',
    password: 'password123',
    name: 'Demo User',
    roles: {
      isBuyer: true,
      isSeller: false,
    },
    stats: {
      totalPurchases: 0,
      totalSales: 0,
    },
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const user = mockUsers.find(
            (u) => u.email === email && u.password === password
          );
          if (!user) {
            throw new Error('Invalid email or password');
          }
          const { password: _, ...userData } = user;
          set({
            isAuthenticated: true,
            user: userData as User,
            loading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      register: async (email: string, password: string, name: string) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const newUser = {
            id: crypto.randomUUID(),
            email,
            name,
            roles: {
              isBuyer: true,
              isSeller: false,
            },
            stats: {
              totalPurchases: 0,
              totalSales: 0,
            },
          };
          set({
            isAuthenticated: true,
            user: newUser,
            loading: false,
          });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      logout: async () => {
        try {
          console.log('Starting logout process...');
          set({ loading: true, error: null });
          const currentUser = get().user;
          if (currentUser?.wallet?.isConnected) {
            console.log('Wallet connected, disconnecting...');
            await get().disconnectWallet();
          } else {
            console.log('No wallet connected, clearing state...');
            set({
              isAuthenticated: false,
              user: null,
              error: null,
              loading: false,
            });
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();
            console.log('State cleared, redirecting to /');
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Logout error:', error);
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set({ loading: false });
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      connectWallet: async () => {
        try {
          set({ loading: true, error: null });
      
          const ethereum = (window as any).ethereum;
      
          if (!ethereum) {
            throw new Error("Please install MetaMask or another Web3 wallet.");
          }
      
          // Use MetaMask directly for the account request.
          // This is the actual wallet connection step.
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
      
          if (!accounts || accounts.length === 0) {
            throw new Error("No wallet account selected.");
          }
      
          const address = accounts[0];
      
          // BrowserProvider for subsequent ethers operations.
          const provider = new ethers.BrowserProvider(ethereum);
      
          // Get chain ID after the wallet has connected.
          let chainId = 1;
      
          try {
            const chainIdHex = await ethereum.request({
              method: "eth_chainId",
            });
      
            chainId = parseInt(chainIdHex, 16);
          } catch (e) {
            console.warn("Could not fetch network info:", e);
          }
      
          // Balance is optional and must NOT determine connection success.
          let formattedBalance = "0.0";
      
          try {
            const balance = await provider.getBalance(address);
            formattedBalance = ethers.formatEther(balance);
          } catch (e) {
            console.warn("Could not fetch balance:", e);
          }
      
          const userId = crypto.randomUUID();
      
          const newUser = {
            id: userId,
            wallet: {
              address,
              isConnected: true,
              provider: "metamask",
              chainId,
              balance: formattedBalance,
            },
            roles: {
              isBuyer: true,
              isSeller: false,
            },
            stats: {
              totalPurchases: 0,
              totalSales: 0,
            },
          };
      
          set({
            isAuthenticated: true,
            user: newUser,
            loading: false,
            error: null,
          });
      
        } catch (error) {
          console.error("Wallet connection failed:", error);
      
          let errorMessage = "Failed to connect wallet. Please try again.";
      
          if (error instanceof Error) {
            if (
              error.message.toLowerCase().includes("user rejected") ||
              error.message.toLowerCase().includes("user denied")
            ) {
              errorMessage = "Wallet connection was rejected.";
            } else if (error.message.toLowerCase().includes("already pending")) {
              errorMessage =
                "A wallet connection request is already pending in MetaMask. Please open MetaMask and complete or reject it.";
            } else if (error.message.includes("MetaMask")) {
              errorMessage = "Please install MetaMask.";
            }
          }
      
          set({
            error: errorMessage,
            loading: false,
          });
        }
      },

      initializeWalletListeners: () => {
        const ethereum = (window as any).ethereum;

        if (!ethereum) return;

        const handleAccountsChanged = async (accounts: string[]) => {
          if (accounts.length === 0) {
            await get().disconnectWallet();
            return;
          }

          const currentAddress = get().user?.wallet?.address;

          if (
            currentAddress &&
            currentAddress.toLowerCase() === accounts[0].toLowerCase()
          ) {
            return;
          }

          // Update the existing user instead of calling connectWallet()
          // and creating another listener.
          const currentUser = get().user;

          if (currentUser) {
            set({
              user: {
                ...currentUser,
                wallet: {
                  ...currentUser.wallet,
                  address: accounts[0],
                  isConnected: true,
                },
              },
              isAuthenticated: true,
            });
          }
        };

        const handleChainChanged = async (chainIdHex: string) => {
          const chainId = parseInt(chainIdHex, 16);

          const currentUser = get().user;

          if (currentUser) {
            set({
              user: {
                ...currentUser,
                wallet: {
                  ...currentUser.wallet,
                  chainId,
                },
              },
            });
          }
        };

        ethereum.on("accountsChanged", handleAccountsChanged);
        ethereum.on("chainChanged", handleChainChanged);

        return () => {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
        };
      },
      
      disconnectWallet: async () => {
        try {
          set({ loading: true, error: null });
          if ((window as any).ethereum) {
            (window as any).ethereum.removeAllListeners('accountsChanged');
            (window as any).ethereum.removeAllListeners('chainChanged');
          }
          set({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          });
          localStorage.removeItem('auth-storage');
          sessionStorage.clear();
          window.location.href = '/';
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      submitKYC: async (documents: KYCData['documents']) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  kyc: {
                    status: 'pending',
                    idVerified: false,
                    addressVerified: false,
                    documents,
                    verificationDate: new Date(),
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      updateKYCStatus: async (status: KYCData['status']) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user && state.user.kyc
              ? {
                  ...state.user,
                  kyc: {
                    ...state.user.kyc,
                    status,
                    idVerified: status === 'verified',
                    addressVerified: status === 'verified',
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      toggleRole: async (role: 'buyer' | 'seller', enabled: boolean) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  roles: {
                    ...state.user.roles,
                    [role === 'buyer' ? 'isBuyer' : 'isSeller']: enabled,
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      connectBankAccount: async (accountDetails: any) => {
        try {
          set({ loading: true, error: null });
          await new Promise((resolve) => setTimeout(resolve, 1000));
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  bankAccount: {
                    isVerified: true,
                    last4: accountDetails.last4,
                    type: accountDetails.type,
                  },
                }
              : null,
            loading: false,
          }));
        } catch (error) {
          set({
            error: (error as Error).message,
            loading: false,
          });
        }
      },

      clearError: () => set({ error: null }), // Implementation of clearError
    }),
    {
      name: 'auth-storage',
    }
  )
);