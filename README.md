# HydroCred 🌊

**Blockchain-powered Green Hydrogen Credit System**

HydroCred is a comprehensive decentralized application (DApp) for issuing, certifying, and trading verified green hydrogen production credits on the blockchain. Built with immutable audit trails, hierarchical role-based access control, and gasless ERC-721 tokens.

![HydroCred System Architecture](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=HydroCred+Architecture)

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Hardhat)     │
│                 │    │                 │    │                 │
│ • Role-based    │    │ • MongoDB       │    │ • ERC-721       │
│   Dashboards    │    │ • Express APIs  │    │ • AccessControl │
│ • Wallet Connect│    │ • Authentication│    │ • Gasless Mint  │
│ • Marketplace   │    │ • Audit Logs    │    │ • Role Mgmt     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔐 Role Hierarchy & Permissions

### 🛡️ Admin Hierarchy (Top-Down)
```
Main Admin (Root)
├── Country Admin
│   ├── State Admin
│   │   └── City Admin (Certifier)
│   │       └── Producer
│   └── State Admin
│       └── City Admin (Certifier)
└── Country Admin
    └── State Admin
        └── City Admin (Certifier)
```

### 👥 User Roles & Capabilities

| Role | Appointed By | Can Appoint | Can Certify | Can Mint | Can Trade |
|------|-------------|-------------|-------------|----------|-----------|
| **Main Admin** | Contract Deploy | Country Admins | ❌ | ❌ | ❌ |
| **Country Admin** | Main Admin | State Admins | ❌ | ❌ | ❌ |
| **State Admin** | Country Admin | City Admins | ❌ | ❌ | ❌ |
| **City Admin** | State Admin | ❌ | ✅ Producers | ❌ | ❌ |
| **Producer** | City Admin | ❌ | ❌ | ✅ (with cert) | ✅ |
| **Buyer** | Self-register | ❌ | ❌ | ❌ | ✅ |
| **Auditor** | Main Admin | ❌ | ❌ | ❌ | ❌ |

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **MetaMask** browser extension
- **MongoDB** (local or cloud)
- **Polygon Mumbai** testnet access

### 1. Clone & Install

```bash
git clone <repository-url>
cd HydroCred
npm install
npm run install:all
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Blockchain Configuration
RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_deployer_private_key_here
MAIN_ADMIN_ADDRESS=0x1234567890123456789012345678901234567890
EXPLORER_API_KEY=your_polygonscan_api_key

# Backend Configuration
PORT=5055
MONGODB_URI=mongodb://localhost:27017/hydrocred
JWT_SECRET=your_jwt_secret_key_here
AES_KEY=your_32_character_encryption_key_here

# Frontend Configuration
VITE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
VITE_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_PROJECT_ID
VITE_CHAIN_ID=80001
```

### 3. Deploy Smart Contracts

```bash
# Compile contracts
npm run chain:compile

# Deploy to testnet
npm run chain:deploy
```

**Important:** The `MAIN_ADMIN_ADDRESS` in your `.env` will be hardcoded as the root admin in the smart contract.

### 4. Start the Application

```bash
# Start frontend + backend
npm run dev
```

Access the application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5055

## 🎯 Demo Workflow

### 1. Initial Setup
```bash
# Deploy contract (sets MAIN_ADMIN_ADDRESS as root admin)
npm run chain:deploy

# Main Admin appoints Country Admin
# Country Admin appoints State Admin  
# State Admin appoints City Admin
# City Admin approves Producers
```

### 2. Production Workflow
```
Producer → Submit Production Request → City Admin Certifies → Mint Tokens
```

### 3. Trading Workflow
```
Producer → List Credits → Buyer Purchases → Credits Transferred
```

### 4. Retirement
```
Buyer → Retire Credits → Tokens Burned → Carbon Offset Verified
```

## 🛠️ Technology Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **TailwindCSS** + **shadcn/ui** for UI components
- **Framer Motion** for animations
- **Ethers.js** for blockchain interaction
- **React Hook Form** + **Zod** for form validation

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** for data persistence
- **JWT** for authentication
- **Ethers.js** + **Web3.js** for blockchain integration
- **Express Validator** for input validation

### Blockchain
- **Hardhat** for development & testing
- **Solidity** + **OpenZeppelin** for smart contracts
- **Polygon Mumbai** testnet
- **ERC-721** for non-fungible tokens
- **AccessControl** for role management

## 📋 Smart Contract Features

### HydroCredToken.sol
- **ERC-721 Standard:** Each credit = 1 kg of green hydrogen
- **Gasless Minting:** Admin authority with certification workflow
- **Role Hierarchy:** Main Admin → Country → State → City → Producer
- **Certification System:** City Admin signature required for minting
- **Fraud Prevention:** Hash-based certification tracking
- **Retirement System:** Permanent token burning for carbon offset

### Security Features
- **Fixed Root Admin:** `MAIN_ADMIN_ADDRESS` hardcoded in contract
- **Role Verification:** On-chain role checks for all operations
- **Signature Validation:** Cryptographic verification of certifications
- **Double-Spend Prevention:** Certification hash tracking
- **Pausable:** Emergency stop functionality

## 🔧 Development Commands

### Root Level
```bash
npm run dev              # Start frontend + backend
npm run install:all      # Install all workspace dependencies
npm run chain:compile    # Compile smart contracts
npm run chain:deploy     # Deploy to testnet
npm run chain:test       # Run contract tests
```

### Individual Workspaces
```bash
# Blockchain
npm -w blockchain run compile
npm -w blockchain run deploy
npm -w blockchain run test

# Backend
npm -w backend run dev
npm -w backend run build
npm -w backend run start

# Frontend
npm -w frontend run dev
npm -w frontend run build
npm -w frontend run preview
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Wallet-based login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Admin Management
- `POST /api/admin/appoint-country-admin` - Appoint country admin
- `POST /api/admin/appoint-state-admin` - Appoint state admin
- `POST /api/admin/appoint-city-admin` - Appoint city admin
- `POST /api/admin/approve-producer` - Approve producer
- `GET /api/admin/pending-approvals` - Get pending approvals

### Production
- `POST /api/production/submit-request` - Submit production request
- `POST /api/production/certify` - Certify production request
- `POST /api/production/mint` - Mint tokens
- `GET /api/production/requests` - Get production requests

### Audit
- `GET /api/audit/transactions` - Get transaction history
- `GET /api/audit/production-requests` - Get production requests
- `GET /api/audit/export` - Export audit data (JSON/CSV)
- `GET /api/audit/statistics` - Get audit statistics

## 🎮 Demo Wallets & Private Keys

For testing purposes, you can use these demo wallets:

```bash
# Main Admin (Root)
Address: 0x1234567890123456789012345678901234567890
Private Key: 0x1234567890123456789012345678901234567890123456789012345678901234

# Country Admin
Address: 0x2345678901234567890123456789012345678901
Private Key: 0x2345678901234567890123456789012345678901234567890123456789012345

# State Admin
Address: 0x3456789012345678901234567890123456789012
Private Key: 0x3456789012345678901234567890123456789012345678901234567890123456

# City Admin
Address: 0x4567890123456789012345678901234567890123
Private Key: 0x4567890123456789012345678901234567890123456789012345678901234567

# Producer
Address: 0x5678901234567890123456789012345678901234
Private Key: 0x5678901234567890123456789012345678901234567890123456789012345678

# Buyer
Address: 0x6789012345678901234567890123456789012345
Private Key: 0x6789012345678901234567890123456789012345678901234567890123456789
```

**⚠️ Warning:** These are demo keys for testing only. Never use in production!

## 🔐 Admin Hierarchy Explanation

### How Admins Are Appointed

1. **Main Admin (Root)**
   - Set during contract deployment via `MAIN_ADMIN_ADDRESS`
   - Cannot be changed after deployment
   - Has `DEFAULT_ADMIN_ROLE` and `MAIN_ADMIN_ROLE`

2. **Country Admin**
   - Appointed by Main Admin via `appointCountryAdmin(address, countryId)`
   - Can appoint State Admins within their country
   - Has `COUNTRY_ADMIN_ROLE`

3. **State Admin**
   - Appointed by Country Admin via `appointStateAdmin(address, stateId)`
   - Can appoint City Admins within their state
   - Has `STATE_ADMIN_ROLE`

4. **City Admin (Certifier)**
   - Appointed by State Admin via `appointCityAdmin(address, cityId)`
   - Can certify production requests from producers
   - Can approve producer registrations
   - Has `CITY_ADMIN_ROLE`

### Role Verification
- All role assignments are stored on-chain
- Role checks enforced in smart contract functions
- Database mirrors on-chain roles for performance
- Cross-verification between blockchain and database

## 🎯 Key Features

### 🔒 Security-First Design
- **Root Admin Fixed:** `MAIN_ADMIN_ADDRESS` hardcoded in contract
- **Role Enforcement:** On-chain role verification for all operations
- **Certification Workflow:** Multi-step approval process
- **Fraud Prevention:** Hash-based certification tracking
- **Audit Trail:** Complete transaction history

### 🌱 Green Hydrogen Focus
- **1:1 Token Ratio:** Each token = 1 kg of certified green hydrogen
- **Production Tracking:** End-to-end certification workflow
- **Carbon Offset:** Token retirement for environmental impact
- **Transparency:** Public blockchain verification

### 📈 Scalable Architecture
- **Modular Design:** Separate frontend, backend, and blockchain
- **Role-Based Access:** Granular permissions system
- **API-First:** RESTful APIs for all operations
- **Audit-Ready:** Export capabilities for compliance

## 🚀 Future Enhancements

- **IPFS Integration** for document storage
- **Multi-sig Governance** for admin management
- **Carbon Credit Marketplace** with pricing
- **Mobile App** with QR code scanning
- **Oracle Integration** for real-world data feeds
- **Layer 2 Scaling** (Polygon, Arbitrum)
- **Cross-Chain Bridges** for interoperability

## 🐛 Troubleshooting

### Common Issues

**"Contract not deployed"**
```bash
# Check .env has correct RPC_URL and PRIVATE_KEY
npm run chain:deploy
```

**"MetaMask connection failed"**
- Install MetaMask extension
- Switch to Polygon Mumbai testnet (Chain ID: 80001)
- Ensure wallet has testnet MATIC

**"Backend API errors"**
```bash
# Check MongoDB connection
# Verify CONTRACT_ADDRESS in environment
npm -w backend run dev
```

**"Transaction failed"**
- Ensure sufficient testnet MATIC for gas
- Check wallet is connected to correct network
- Verify you have required role permissions

### Environment Variables Checklist
- [ ] `RPC_URL` - Polygon Mumbai RPC endpoint
- [ ] `PRIVATE_KEY` - Deployer wallet private key
- [ ] `MAIN_ADMIN_ADDRESS` - Root admin wallet address
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `CONTRACT_ADDRESS` - Deployed contract address

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation:** [Wiki Link]
- **Issues:** [GitHub Issues]
- **Discussions:** [GitHub Discussions]

---

**Built with ❤️ for a sustainable hydrogen future**

*HydroCred - Empowering Green Hydrogen with Blockchain Technology*