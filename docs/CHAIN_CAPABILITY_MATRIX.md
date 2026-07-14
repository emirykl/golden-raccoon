# Chain Capability Matrix

This document records the runtime boundary used during the Stellar integration. `frontend/src/server` is the active application server. Existing EVM behavior remains supported while Stellar implementations are added behind chain-family dispatch.

| Capability | EVM-only implementation | Chain-neutral/reusable layer | Stellar implementation target |
| --- | --- | --- | --- |
| Wallet connection | Wagmi, RainbowKit, EVM wallet client | Unified wallet-session interface and explicit user approval | Stellar Wallets Kit and SEP-43 signing |
| Address and transaction identity | `0x` address and hash validation | Chain-family dispatch, canonical identity keys | SDK validation for `G...`, `C...`, issuers and 64-character hashes |
| Portfolio discovery | GoldRush, Alchemy and EVM RPC | Portfolio snapshot, holdings, risk and data-quality models | Stellar RPC plus curated account/trustline data adapter |
| Token input | EVM address and DexScreener resolution | Normalized scan input and identity evidence | XLM, `CODE:ISSUER`, issuer account and contract resolution |
| Onchain analysis | Bytecode, GoPlus, EVM ownership/tax/holder signals | Agent result, findings, sources, confidence and decision orchestration | Issuer controls, trustline state, liquidity and Soroban contract state |
| News and social agents | No chain-specific signing behavior | Token name/symbol research and agent result model | Reuse after collision-safe Stellar asset identity resolution |
| Decision agent | No direct chain calls | Risk aggregation, confidence and recommended-action policy | Reuse Stellar-native specialist results |
| Transaction preparation | EVM transaction preview and confirmation records | Approval-only policy and audit concepts | Soroban simulation, prepared XDR and RPC confirmation |
| Premium x402 | Exact EVM scheme and Base payment | Protected resource, receipt and idempotency concepts | Exact Stellar scheme with SEP-41 USDC |
| Storage/history | Several EVM-shaped address/hash fields | Storage adapter and history APIs | Network-aware canonical addresses, hashes, ledgers and event IDs |
| UI | Some `0x`, gas and EVM-network copy | Shared cards, agent timeline and risk report presentation | Stellar network, issuer, partial valuation and explorer presentation |

## Invariants during integration

1. Chain-neutral modules must not import a wallet signer or silently select a network.
2. EVM providers remain behind the EVM branch; Stellar provider failures never fall back to EVM or mock data.
3. Stellar assets are identified by native identity, code plus issuer, or contract ID, never by symbol alone.
4. Every state-changing operation is prepared and simulated by the server but signed only by the connected user wallet.
5. Existing EVM quality gates must pass after each integration section.
