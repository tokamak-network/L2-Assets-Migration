// offchain calulation
// @notice Calculates sqrt(1.0001^tick) * 2^96 fix
// feeAmountTickSpacing  mapping(uint24 => int24) public override
export const Q96 = 2n ** 96n;
export const getTickAtSqrtPrice = (sqrtPrice:any) => { //  slot0 참조
  return Math.floor(Math.log(sqrtPrice ** 2) / Math.log(1.0001));
};

export const ConvertDecimal = (amount:any, decimal:any) => {
  return(Number(amount) / 10 ** decimal).toFixed(decimal);
}

export const estimatePoolAmounts = async (liquidity:any, sqrtPriceX96:any, tickLow:any, tickUpper:any) => {
  const sqrtRatioA = Math.sqrt(1.0001 ** Number(tickLow));
  const sqrtRatioB = Math.sqrt(1.0001 ** Number(tickUpper));
  
  const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
  const tickCurrent = getTickAtSqrtPrice(sqrtPrice);

  let value0 = 0;
  let value1 = 0;

  if (tickCurrent < tickLow) {
    value0 = Math.floor(Number(liquidity) * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)));
  } else if (tickCurrent >= tickUpper) {

    value1 = Math.floor(Number(liquidity) * (sqrtRatioB - sqrtRatioA));
  } else if (tickCurrent >= tickLow && tickCurrent < tickUpper) {
 
    value0 = Math.floor(Number(liquidity) * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)));
    value1 = Math.floor(Number(liquidity) * (sqrtPrice - sqrtRatioA));
  }

  return { value0, value1 };
}

// v3 Pool 망가지거나 부득이하게 수집을 정확하게 하지못하는 경우 리베이스를 통해 풀을 재조정하기 위해 사용
export const rebase = async() =>{
  // rebaseWithdrawals algorithm
  let totalPoolTokens = 46709463561169165244n; // 실제 풀이 보유한 토큰 양
  // 각 계정의 요청량
  let requestAccount1 = 46557717369782883062n;
  let requestAccount2 = 18865250547189939n;
  let requestAccount3 = 1017950367489426691n;
  let totalRequested = requestAccount1 + requestAccount2 + requestAccount3; // 총 요청량

  // account per ratio
  const a1 = Number(requestAccount1) / Number(totalRequested) * 100
  const a2 = Number(requestAccount2) / Number(totalRequested) * 100
  const a3 = Number(requestAccount3) / Number(totalRequested) * 100

  // resizing - rebase
  const ra1 = Number(totalPoolTokens) * a1 / 100;
  const ra2 = Number(totalPoolTokens) * a2 / 100;
  const ra3 = Number(totalPoolTokens) * a3 / 100;
  console.log(ra1)
  console.log(ra2)
  console.log(ra3)
  console.log(ra1+ ra2 + ra3)
  console.log(totalPoolTokens)
}

