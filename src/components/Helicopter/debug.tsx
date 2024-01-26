import { useControls } from "leva";
import { Dispatch, useEffect } from "react";

type DebugBalanceProps = {
  balance: {
    springXZ: number
    dampingXZ: number
    springY: number
    dampingY: number
  },
  setBalance: Dispatch<React.SetStateAction<{
    springXZ: number;
    dampingXZ: number;
    springY: number;
    dampingY: number;
  }>>
}

export function DebugBalance(
  { balance,
    setBalance }: DebugBalanceProps
) {
  const debug = useControls(
    "Balance",
    {
      springXZ: {
        value: balance.springXZ,
        min: 0,
        max: 100,
      },
      dampingXZ: {
        value: balance.dampingXZ,
        min: 0,
        max: 100,
      },
      springY: {
        value: balance.springY,
        min: 0,
        max: 100,
      },
      dampingY: {
        value: balance.dampingY,
        min: 0,
        max: 100,
      },
    },
  );

  useEffect(() => {
    setBalance({
      springXZ: debug.springXZ,
      dampingXZ: debug.dampingXZ,
      springY: debug.springY,
      dampingY: debug.dampingY
    })
  }, [debug, setBalance])

  return null
}

type DebugFloatProps = {
  float: {
    stable: number,
    lift: number,
    hoverHeight: number
  }
  setFloat: Dispatch<React.SetStateAction<{
    stable: number,
    lift: number,
    hoverHeight: number
  }>>
}

export function DebugFloat({ float,
  setFloat }: DebugFloatProps) {
  const debug = useControls("Float", {
    stable: {
      value: float.stable,
      min: 0,
      max: 100,
    },
    lift: {
      value: float.lift,
      min: 0,
      max: 100,
    },
    hoverHeight: {
      value: float.hoverHeight,
      min: 0,
      max: 8
    }
  })

  useEffect(() => {
    setFloat({
      stable: debug.stable,
      lift: debug.lift,
      hoverHeight: debug.hoverHeight
    })
  }, [debug, setFloat])

  return null
}