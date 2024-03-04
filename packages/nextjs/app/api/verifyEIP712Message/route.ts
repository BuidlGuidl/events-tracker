import { NextResponse } from "next/server";
// import { kv } from "@vercel/kv";
import { recoverTypedDataAddress } from "viem";
import { EIP_712_DOMAIN, EIP_712_TYPES__MESSAGE } from "~~/utils/eip712";

type ReqBody = {
  signature: `0x${string}`;
  signer: string;
  message: string;
  action: string;
  event: string;
  amount: number;
};

export const POST = async (req: Request) => {
  try {
    const { signature, signer, action, event, amount } = (await req.json()) as ReqBody;
    if (!signature || !signer || !action || !event || !amount) {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
    if (action !== "Event Expense") {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
    // TODO: get events from KV
    if (event !== "ETHDenver 2024") {
      return NextResponse.json({ verified: false }, { status: 400 });
    }
    const recoveredAddress = await recoverTypedDataAddress({
      domain: EIP_712_DOMAIN,
      types: EIP_712_TYPES__MESSAGE,
      primaryType: "Message",
      message: { action, event, amount: BigInt(amount) },
      signature: signature,
    });

    console.log("recoveredAddress", recoveredAddress);

    if (recoveredAddress !== signer) {
      return NextResponse.json({ verified: false }, { status: 401 });
    }

    // const key = `events-tracker-expenses`;

    return NextResponse.json({ verified: true }, { status: 201 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ verified: false }, { status: 500 });
  }
};
