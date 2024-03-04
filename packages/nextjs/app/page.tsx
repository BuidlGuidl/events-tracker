"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount, useSignMessage, useSignTypedData } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { EIP_712_DOMAIN, EIP_712_TYPES__MESSAGE } from "~~/utils/eip712";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { signMessageAsync, isLoading: isSigningSimpleMessage } = useSignMessage();
  const { signTypedDataAsync, isLoading: isSigningEIP712Message } = useSignTypedData();

  const [selectedEvent, setSelectedEvent] = useState<string>("ETHDenver 2024");
  const [amount, setAmount] = useState<number>(0);

  const action = "Event Expense";

  // Sign simple message
  const handleSimpleMessageSign = async () => {
    try {
      const message = "SE-2";
      const signature = await signMessageAsync({
        message: message,
      });
      const response = await fetch("/api/verifySimpleMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature, signer: connectedAddress }),
      });

      if (response.ok) {
        const data = (await response.json()) as { verified: boolean };
        notification.success(data.verified ? "Message Verified" : "Message Not Verified");
      } else {
        notification.error("Failed to verify message");
      }
    } catch (e) {
      const parsedErrorMessage = getParsedError(e);
      notification.error(parsedErrorMessage);
    }
  };

  const handleEIP712MessageSign = async () => {
    try {
      const signature = await signTypedDataAsync({
        domain: EIP_712_DOMAIN,
        types: EIP_712_TYPES__MESSAGE,
        primaryType: "Message",
        message: {
          action,
          event: selectedEvent,
          amount: BigInt(amount),
        },
      });

      const res = await fetch("/api/verifyEIP712Message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature, signer: connectedAddress, action, event: selectedEvent, amount }),
      });

      if (res.ok) {
        const data = (await res.json()) as { verified: boolean };
        notification.success(data.verified ? "Message Verified" : "Message Not Verified");
      } else {
        notification.error("Failed to verify message");
      }
    } catch (e) {
      const parsedErrorMessage = getParsedError(e);
      notification.error(parsedErrorMessage);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 flex flex-col items-center justify-center">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex justify-center items-center space-x-2">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="text-center text-lg">
            Get started by editing{" "}
            <code className="italic bg-base-300 text-base font-bold max-w-full break-words break-all inline-block">
              packages/nextjs/app/page.tsx
            </code>
          </p>
          <div className="flex gap-3 self-center mb-4">
            <label className="label">Select Event</label>
            <select className="select select-bordered w-48" onChange={value => setSelectedEvent(value.target.value)}>
              <option>ETHDenver 2024</option>
            </select>
          </div>
          <div className="flex gap-3 self-center mb-4">
            <label className="label">Amount (USD)</label>
            <input
              type="number"
              className="input input-bordered w-48"
              placeholder="Amount (USD)"
              value={amount}
              onChange={value => setAmount(parseInt(value.target.value))}
            />
          </div>
          <div className="flex gap-3 self-center">
            <button className="btn btn-primary" disabled={isSigningSimpleMessage} onClick={handleSimpleMessageSign}>
              {isSigningSimpleMessage && <span className="loading loading-spinner"></span>}
              Sign Simple Message
            </button>

            <button className="btn btn-primary" disabled={isSigningEIP712Message} onClick={handleEIP712MessageSign}>
              {isSigningEIP712Message && <span className="loading loading-spinner"></span>}
              Sign EIP712 Message{" "}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
