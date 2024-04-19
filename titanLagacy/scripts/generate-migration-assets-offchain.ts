// offchain calulation
// @notice Calculates sqrt(1.0001^tick) * 2^96 fix
// feeAmountTickSpacing  mapping(uint24 => int24) public override
// mint 이벤트 순서 가져올수있긴함 --> 유동성에따라 가격과 틱이 변화하고 liqu
const Q96 = 2n ** 96n;
const getTickAtSqrtPrice = (sqrtPrice:any) => { // get now tick --> issue 없음  --> 구지 계산안해도됨 slot0 참조하면되긴한데.. 
  return Math.floor(Math.log(sqrtPrice ** 2) / Math.log(1.0001));
};

const estimatePoolAmounts = async (liquidity:any, sqrtPriceX96:any, tickLow:any, tickUpper:any) => {
  const sqrtRatioA = Math.sqrt(1.0001 ** Number(tickLow));
  const sqrtRatioB = Math.sqrt(1.0001 ** Number(tickUpper));
  
  const sqrtPrice = Number(sqrtPriceX96) / Number(Q96);
  const tickCurrent = getTickAtSqrtPrice(sqrtPrice);

  // console.log('tick current -> ', tickCurrent)

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

const ConvertDecimal = (amount:any, decimal:any) => {
  return(Number(amount) / 10 ** decimal).toFixed(decimal);
}