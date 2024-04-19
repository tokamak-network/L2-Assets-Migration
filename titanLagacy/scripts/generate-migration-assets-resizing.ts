// 어느정도 손실을 감수하고 resizing - rebase
const main = async() =>{
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