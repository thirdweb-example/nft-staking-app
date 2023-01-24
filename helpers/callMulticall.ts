export const callMulticall = (options) => {
  const {
    multicall,
    target,
    encoder,
    calls,
  } = options

  return new Promise((resolve, reject) => {
    const ret = {}
    const mcCallToValue = []
    const mcCalls = Object.keys(calls).map((targetKey) => {
      const {
        func,
        args
      } = calls[targetKey]
      mcCallToValue.push(targetKey)
      return {
        target,
        callData: encoder.encodeFunctionData(func, args)
      }
    })
    multicall.methods.aggregate(mcCalls).call().then((answers) => {
      answers.returnData.forEach((retData, index) => {
        let val = encoder.decodeFunctionResult(
          calls[mcCallToValue[index]].func,
          retData
        )[0]
        if (val && val._isBigNumber) val = val.toString()

        ret[mcCallToValue[index]] = val
      })
      resolve(ret)
    }).catch((err) => {
      reject(err)
    })
  })
}

export const callMulticallGroup = (options) => {
  const {
    multicall,
    calls,
  } = options

  return new Promise((resolve, reject) => {
    const ret = {}
    const mcCalls = calls.map((callData) => {
      const {
        group,
        func,
        args,
        encoder,
        target
      } = callData

      if (!ret[group]) ret[group] = {}
      return {
        target,
        callData: encoder.encodeFunctionData(func, args || [])
      }
    })
    multicall.methods.aggregate(mcCalls).call().then((answers) => {
      answers.returnData.forEach((retData, index) => {
        let val = calls[index].encoder.decodeFunctionResult(
          calls[index].func,
          retData
        )[0]
        if (val && val._isBigNumber) val = val.toString()

        ret[calls[index].group][calls[index].value || calls[index].func] = val
      })
      resolve(ret)
    }).catch((err) => {
      reject(err)
    })
  })
}