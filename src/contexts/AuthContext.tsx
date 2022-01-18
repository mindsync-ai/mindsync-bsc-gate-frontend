import { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

import { useSnackbar } from "./Snackbar";
import { config } from "../config";

export const AuthContext = createContext<any>({
  address: null,
  chainId: null,
  loading: false,
  connect: () => null,
  disconnect: () => null,
  switchChain: () => null,
});

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: {
        1: config.ETH_Network_RPC,
        56: config.BSC_Network_RPC,
      },
    },
  },
};

let web3Modal = new Web3Modal({
  network: "binance",
  cacheProvider: true,
  providerOptions
});

export const AuthProvider = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [web3, setWeb3] = useState<any>(null);
  const { showSnackbar } = useSnackbar();

  const subscribeProvider = (provider) => {
    provider.on("disconnect", (error) => {
      console.log('disconnect event');
    });
    provider.on("accountsChanged", (accounts) => {
      setAddress(accounts[0]);
      showSnackbar({
        severity: "info",
        message: "Account Changed",
      });
    });
    // Subscribe to chainId change
    provider.on("chainChanged", (chainId) => {
      setChainId(chainId);
    });
  };

  const connect = async () => {
    if (address) {
      return;
    }
    setLoading(true);

    try {
      let web3 = new Web3(Web3.givenProvider);

      if (!web3.currentProvider) {
        showSnackbar({
          severity: "error",
          message: "No provider was found",
        });
        return;
      }
      const provider = await web3Modal.connect();
      subscribeProvider(provider);
      web3 = new Web3(provider);
      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();
      const chain = await web3.eth.getChainId();
      setAddress(accounts[0]);
      setChainId(chain);
    } catch (err) {
      web3Modal.clearCachedProvider();
      console.error(err);
      showSnackbar({
        severity: "error",
        message: "Failed to connect",
      });
    }
    setLoading(false);
  };

  const disconnect = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    web3Modal.clearCachedProvider();
    setChainId(null);
    setAddress(null);
  };

  const switchChain = async (chainId) => {
    if (!web3) {
      showSnackbar({
        severity: "error",
        message: "Please connect your wallet.",
      });
      return false;
    }
    if (chainId !== 1 && chainId !== 56) {
      showSnackbar({
        severity: "error",
        message: "Other Network",
      });
      return false;
    }

    let result = true;
    setLoading(true);
    if (web3.currentProvider.isMetaMask) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        const accounts = await web3.eth.getAccounts();
        const chain = await web3.eth.getChainId();
        setAddress(accounts[0]);
        setChainId(chain);
        console.log('chain--------', accounts[0], chain);
        showSnackbar({
          severity: "info",
          message: "Network Changed",
        });
        result = true;
      } catch (err) {
        console.log(err);
        showSnackbar({
          severity: "error",
          message: "Failed to switch network",
        });
        result = false;
      }
    } else {
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        await web3.currentProvider.close();
      }

      try {
        web3Modal = new Web3Modal({
          network: chainId === 1 ? "mainnet" : "binance",
          cacheProvider: true,
          providerOptions
        });
        const provider = await web3Modal.connect();
        subscribeProvider(provider);
        const switchedWeb3 = new Web3(provider);
        setWeb3(switchedWeb3);

        const accounts = await switchedWeb3.eth.getAccounts();
        const chain = await switchedWeb3.eth.getChainId();
        setAddress(accounts[0]);
        setChainId(chain);
        showSnackbar({
          severity: "info",
          message: "Network Changed",
        });
        result = true;
      } catch (err) {
        web3Modal.clearCachedProvider();
        console.error('AuthContextError:', err);
        showSnackbar({
          severity: "error",
          message: "Failed to switch network",
        });
        result = false;
      }
    }
    setLoading(false);
    return result;
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{ address, chainId, loading, connect, disconnect, switchChain }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
