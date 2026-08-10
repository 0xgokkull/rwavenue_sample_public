# RWAvenue Whitepaper

**Real-World Asset Tokenization on Pharos Blockchain**

Version 1.0 · July 2026

---

## Abstract

RWAvenue is a decentralized marketplace for tokenizing and trading real-world assets (RWAs)—including real estate, luxury goods, art, and collectibles. Built for the Pharos Blockchain Hackathon, the platform combines ERC-3643-inspired compliant security tokens, a validator-driven verification network, fractional ownership via ERC-1155, and IPFS-backed asset metadata.

This document describes the problem RWAvenue addresses, the platform architecture, smart contract design, off-chain infrastructure, user flows, security model, and development roadmap.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Platform Architecture](#4-platform-architecture)
5. [Smart Contract Layer](#5-smart-contract-layer)
6. [Off-Chain Infrastructure](#6-off-chain-infrastructure)
7. [Core User Flows](#7-core-user-flows)
8. [Validator & Compliance Model](#8-validator--compliance-model)
9. [Marketplace Mechanics](#9-marketplace-mechanics)
10. [Security Considerations](#10-security-considerations)
11. [Technology Stack](#11-technology-stack)
12. [Roadmap](#12-roadmap)
13. [Conclusion](#13-conclusion)

---

## 1. Introduction

Real-world assets represent trillions of dollars in global value, yet most remain locked behind high capital requirements, slow settlement, opaque ownership records, and limited secondary market liquidity. Blockchain technology offers a path to fractionalize ownership, improve transparency, and enable peer-to-peer trading—but only when paired with robust identity verification, asset validation, and regulatory-aware token standards.

**RWAvenue** bridges physical assets and on-chain markets by providing:

- A **tokenization pipeline** that converts verified assets into compliant digital tokens
- A **marketplace** supporting fixed-price sales and auctions
- A **validator network** for authenticity and condition verification
- A **KYC/identity layer** aligned with ERC-3643 security token patterns

The platform targets **Pharos Devnet** as its primary blockchain environment, with an architecture designed for future multi-chain expansion.

---

## 2. Problem Statement

### 2.1 Illiquidity of High-Value Assets

Real estate, fine art, luxury watches, and commercial property typically require substantial capital to acquire. Secondary markets are fragmented, intermediated, and slow. Small investors are largely excluded from these asset classes.

### 2.2 Trust and Verification Gaps

Buyers cannot easily verify provenance, condition, or legal ownership of physical assets in digital marketplaces. Without trusted third-party validation, tokenized claims on real assets carry significant counterparty risk.

### 2.3 Regulatory and Compliance Requirements

Security tokens representing real-world assets must comply with identity verification, transfer restrictions, and—in some jurisdictions—forced recovery mechanisms. Generic ERC-20 or ERC-721 tokens lack these capabilities out of the box.

### 2.4 Fragmented Infrastructure

Existing solutions often treat tokenization, storage, identity, and trading as separate products. RWAvenue integrates these layers into a unified platform experience.

---

## 3. Solution Overview

RWAvenue delivers an end-to-end RWA lifecycle:

```
Asset Submission → Document Upload (IPFS) → Validator Review → On-Chain Minting
      → Marketplace Listing → KYC-Verified Purchase → Ownership Transfer
```

### Key Capabilities

| Capability | Description |
|------------|-------------|
| **Asset Tokenization** | Convert verified physical assets into ERC-1155 security tokens with IPFS metadata |
| **Fractional Ownership** | Split high-value assets into tradable token fractions |
| **Secure Marketplace** | Fixed-price and auction listings with platform fees and royalty support |
| **Identity & KYC** | On-chain identity registry with validator-gated verification |
| **Compliance Hooks** | ERC-3643-style transfer restrictions, freezing, and forced transfer |
| **Decentralized Storage** | Pinata/IPFS for images, documents, and token metadata |

---

## 4. Platform Architecture

RWAvenue follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│   Marketplace · Tokenization · Dashboard · Validators · KYC  │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API / Wallet (ethers.js)
┌──────────────────────────▼──────────────────────────────────┐
│                  Backend API (Express + TypeScript)          │
│   Assets · Transactions · Validators · Dashboard · Users     │
└──────────────────────────┬──────────────────────────────────┘
                           │ Prisma ORM
┌──────────────────────────▼──────────────────────────────────┐
│                    PostgreSQL Database                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Pharos Blockchain (Smart Contracts)             │
│  RWAvenueToken · RWAvenueMarketplace · RWAvenueKYC · Factory │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    IPFS (Pinata Gateway)                     │
│              Asset images · Documents · Metadata JSON          │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

- **Frontend** — User interface for browsing, tokenizing, trading, and managing assets; wallet connection via MetaMask; IPFS uploads via Pinata SDK.
- **Backend API** — Off-chain indexing, search, dashboard analytics, validator management, and transaction history. Serves as a performance and UX layer alongside on-chain state.
- **Smart Contracts** — Source of truth for token ownership, listing state, KYC status, and settlement.
- **IPFS** — Immutable storage for asset media and supporting documentation referenced by on-chain URIs.

---

## 5. Smart Contract Layer

All contracts are written in **Solidity ^0.8.20** using **OpenZeppelin Upgradeable** patterns (UUPS proxies, AccessControl, Pausable).

### 5.1 RWAvenueToken

**Purpose:** ERC-3643-inspired compliant security token for individual asset classes.

**Standard:** ERC-1155 (multi-token, supports fractionalization)

**Key Features:**
- Role-gated minting (`MINTER_ROLE`)
- Identity registry integration — transfers require verified addresses
- Compliance module hooks — `canTransfer` / `transferred` callbacks
- Token-level and wallet-level freezing
- Forced transfer and wallet recovery (regulatory compliance)
- Pausable operations and UUPS upgradeability

### 5.2 RWAvenueTokenFactory

**Purpose:** Deploy minimal proxy (EIP-1167) clones of `RWAvenueToken` for each new asset class.

**Benefits:**
- Gas-efficient deployment per asset
- Isolated token contracts per RWA
- Centralized implementation upgrades via UUPS

### 5.3 RWAvenueMarketplace

**Purpose:** On-chain asset registry and trading venue.

**Listing Types:**
| Type | Mechanism |
|------|-----------|
| **Fixed** | Direct purchase at listed price (ETH or ERC-20) |
| **Auction** | Time-bound bidding with automatic outbid refunds |
| **Swap** | Reserved for future peer-to-peer exchange |

**Asset Lifecycle:**
```
Pending → Validated → Listed → Sold / Cancelled
         ↘ Rejected
         ↘ ActionRequired
```

**Key Functions:**
- `createAsset` — Register a new RWA with metadata and tokenization parameters
- `validateAsset` / `rejectAsset` — Validator-gated approval
- `createListing` — Open a fixed or auction listing
- `buyListing` — Purchase with ReentrancyGuard and SafeERC20
- `placeBid` / `finalizeAuction` — Auction mechanics
- `withdrawFunds` — Platform fee collection

**Fee Model:**
- Configurable platform fee (basis points, capped at 10%)
- Optional royalty support (IERC-2981-compatible, capped at 10%)

### 5.4 RWAvenueKYC

**Purpose:** On-chain identity registry implementing the ERC-3643 `IIdentityRegistry` interface.

**KYC Lifecycle:**
```
Submit Documents (IPFS URIs) → Pending → Verified / Rejected
```

**Features:**
- Document storage via IPFS URI references (government ID, proof of address, additional docs)
- Configurable verification requirements
- Risk level assignment (Low / Medium / High)
- Batch verification for validators
- Full KYC history per address
- `isVerified(address)` gate used by token and marketplace contracts

### 5.5 Role Matrix

| Role | Contracts | Capability |
|------|-----------|------------|
| `ADMIN_ROLE` | All | Platform administration |
| `VALIDATOR_ROLE` | Marketplace, KYC | Asset validation, KYC approval |
| `MINTER_ROLE` | Token | Token minting |
| `PAUSER_ROLE` | All | Emergency pause |
| `FORCED_TRANSFER_ROLE` | Token | Regulatory forced transfers |
| `COMPLIANCE_ROLE` | Token | Compliance configuration |
| `WITHDRAWER_ROLE` | Marketplace, KYC | Fee withdrawal |
| `UPGRADER_ROLE` | All | UUPS implementation upgrades |

---

## 6. Off-Chain Infrastructure

### 6.1 Backend API

Express.js server exposing REST endpoints under `/api`:

| Domain | Endpoints |
|--------|-----------|
| **Assets** | CRUD, search, featured, bids, purchase, verification, history |
| **Transactions** | Purchase, bid, history, refund |
| **Validators** | Listing, applications, reviews, expertise categories |
| **Validation Requests** | Create, update (approve/reject) |
| **Dashboard** | Stats, pending validations, portfolio value |
| **Users** | Assets, payment methods, transaction stats |
| **Health** | Service health check |

### 6.2 Database Schema (PostgreSQL + Prisma)

Core entities:

- **User** — Platform participants with ratings
- **Asset** — Full RWA metadata including tokenization type, listing type, verification status, token counts
- **Validator** — Expertise, jurisdiction, reputation, verification fees
- **Bid** — Auction bid records
- **Transaction** — Buy/sell/bid/tokenize events with optional on-chain hash
- **ValidationRequest** — Authenticity, condition, or value verification requests
- **ValidatorReview** — Community feedback on validators
- **PaymentMethodRecord** — Crypto or card payment preferences

### 6.3 IPFS Storage (Pinata)

Asset tokenization uploads:

1. **Images** — Property photos, product images → individual CIDs
2. **Documents** — Deeds, certificates, appraisals → individual CIDs
3. **Metadata JSON** — Combined asset descriptor referencing all CIDs → master CID

Metadata URIs are designed to be referenced by smart contract `tokenURI` fields upon minting.

---

## 7. Core User Flows

### 7.1 Asset Tokenization

1. Asset owner completes the tokenization form (title, description, category, value, tokenization type)
2. Owner uploads images and supporting documents
3. Files are stored on IPFS via Pinata; CIDs are returned
4. Owner selects a validator for verification
5. Validator reviews documentation (off-chain request + on-chain `validateAsset`)
6. Upon approval, tokens are minted via `RWAvenueTokenFactory` → `RWAvenueToken.mint`
7. Asset appears on the marketplace

### 7.2 Marketplace Purchase (Fixed Price)

1. Buyer browses validated, listed assets
2. Buyer completes KYC (`RWAvenueKYC.submitKYC` → validator approval)
3. Buyer calls `buyListing` with payment (ETH or approved ERC-20)
4. Platform fee and royalty are deducted; seller receives proceeds
5. ERC-1155 tokens transfer to buyer; listing availability decrements

### 7.3 Auction

1. Seller creates an auction listing with `auctionEndTime`
2. Verified buyers place ETH bids via `placeBid`; previous high bidder is refunded
3. After expiry, anyone calls `finalizeAuction`; winner receives tokens

### 7.4 Wallet Authentication

Users connect via MetaMask on **Pharos Devnet** (Chain ID: `50002`). Wallet address serves as the primary on-chain identity, linked to KYC status in `RWAvenueKYC`.

---

## 8. Validator & Compliance Model

### Off-Chain Validators

Validators are registered platform participants with declared expertise (real estate, jewelry, art, etc.), jurisdiction, reputation scores, and verification fees. Users submit validation requests specifying type:

- **Authenticity** — Provenance and legitimacy
- **Condition** — Physical state assessment
- **Value** — Appraisal and fair market value

Approved validations update asset status to `validated`; rejections set status to `rejected`.

### On-Chain Compliance

Before any token transfer or marketplace purchase:

1. `RWAvenueKYC.isVerified(buyer)` must return `true`
2. `ICompliance.canTransfer(from, to, id, amount)` must return `true`
3. Token and wallet must not be frozen

This dual-layer model supports both operational flexibility (off-chain validator workflows) and enforceable on-chain rules (compliant token transfers).

---

## 9. Marketplace Mechanics

### Tokenization Types

| Type | Behavior |
|------|----------|
| **Whole** | Single-owner token representing full asset value |
| **Fractional** | Asset split into N tradable tokens at `pricePerToken` |

### Payment

- Native ETH or whitelisted ERC-20 tokens
- SafeERC20 for token payments
- ReentrancyGuard on all state-changing purchase paths

### Fees

| Fee | Description |
|-----|-------------|
| **Platform Fee** | Percentage of sale price (configurable, max 10%) |
| **Royalty** | Optional creator/issuer royalty on secondary sales (max 10%) |
| **Validator Fee** | Off-chain fee for verification services |

---

## 10. Security Considerations

### Smart Contract Security

- **OpenZeppelin battle-tested libraries** — AccessControl, Pausable, ReentrancyGuard, SafeERC20
- **UUPS upgradeability** — Controlled by `UPGRADER_ROLE` with storage gaps for safe upgrades
- **Emergency pause** — Global halt on transfers and marketplace operations
- **Granular freezing** — Per-token and per-wallet freeze without affecting unrelated holdings
- **Fee caps** — Platform and royalty fees bounded to prevent misconfiguration
- **Role separation** — Least-privilege access across admin, validator, minter, and compliance roles

### Application Security

- CORS restricted to configured frontend origin
- Global error handling middleware
- IPFS credentials managed via environment variables (never committed to version control in production)

### Known Limitations (Current Prototype)

- Backend API lacks authentication and authorization middleware
- Wallet identity is not yet linked to backend user records
- Smart contracts are developed but require deployment and address configuration
- Full frontend-to-contract integration is in progress

---

## 11. Technology Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Pharos Devnet (Chain ID 50002) |
| **Smart Contracts** | Solidity ^0.8.20, OpenZeppelin Upgradeable |
| **Token Standards** | ERC-1155, ERC-3643 patterns |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Zustand |
| **Web3** | ethers.js v6, MetaMask |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **Storage** | Pinata (IPFS) |
| **Dev Tooling** | concurrently, tsx, Prisma Migrate |

---

## 12. Roadmap

### Phase 1 — Core Platform *(Current)*

- [x] Smart contract development (Token, Factory, Marketplace, KYC)
- [x] Backend API with PostgreSQL data layer
- [x] Frontend marketplace UI and tokenization flow
- [x] IPFS integration via Pinata
- [x] Validator directory and validation request API
- [ ] Smart contract deployment to Pharos Devnet
- [ ] End-to-end integration: IPFS → backend → on-chain minting
- [ ] Unified wallet + backend identity linking

### Phase 2 — Enhanced Features

- Multi-chain support (Ethereum L2, Polygon)
- Swap listing type implementation
- Advanced trading (offers, bundles)
- Full KYC user interface
- Compliance contract deployment

### Phase 3 — Market Expansion

- Additional asset classes (commodities, IP, revenue streams)
- Mobile application
- Enhanced analytics and portfolio tools
- Third-party validator marketplace

### Phase 4 — Ecosystem Growth

- Community governance (DAO)
- Partnership integrations (custodians, appraisers, legal)
- Cross-chain asset bridges
- Institutional onboarding tools

---

## 13. Conclusion

RWAvenue addresses the fundamental barriers to real-world asset tokenization: illiquidity, trust, and compliance. By combining ERC-3643-inspired security tokens, a validator verification network, IPFS-backed provenance, and a full-stack marketplace, the platform provides a credible foundation for democratizing access to high-value assets.

Built on Pharos Blockchain with upgradeable, role-governed smart contracts and a modern web stack, RWAvenue is positioned to evolve from hackathon prototype to production-grade RWA infrastructure as integration, deployment, and regulatory partnerships mature.

---

## Appendix A — Contract File Reference

| Contract | Source File |
|----------|-------------|
| RWAvenueToken | `frontend/src/contracts/RWAvenueToken.sol` |
| RWAvenueTokenFactory | `frontend/src/contracts/RWAvenueFactory.sol` |
| RWAvenueMarketplace | `frontend/src/contracts/RWAvenueMarketplace.sol` |
| RWAvenueKYC | `frontend/src/contracts/RWAvenueKYC.sol` |

## Appendix B — API Reference

Base URL: `http://localhost:3001/api` (development)

See `src/routes/index.ts` for the complete route registry.

## Appendix C — Glossary

| Term | Definition |
|------|------------|
| **RWA** | Real-World Asset — a physical or legally recognized asset represented on-chain |
| **ERC-1155** | Multi-token standard enabling fractional ownership in a single contract |
| **ERC-3643** | Security token standard with identity verification and compliance modules |
| **KYC** | Know Your Customer — identity verification process |
| **IPFS** | InterPlanetary File System — decentralized content storage |
| **UUPS** | Universal Upgradeable Proxy Standard — upgrade pattern for smart contracts |
| **CID** | Content Identifier — unique hash referencing IPFS content |

---

*© 2026 RWAvenue. Built for the Pharos Blockchain Hackathon.*
