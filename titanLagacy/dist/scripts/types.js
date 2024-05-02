"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = exports.NonfungibleTokenPositionManager = exports.ERC20 = exports.L2Interface = exports.L1Interface = void 0;
exports.L1Interface = [
    "function deposits(address _firstKey, address _secondKey) public view returns (uint256)"
];
exports.L2Interface = [
    "event DepositFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
    "event Mint(address indexed _account, uint256 _amount)",
    "event Burn(address indexed _account, uint256 _amount)",
    // "event WithdrawalInitiated( address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data )"
];
exports.ERC20 = [
    "function balanceOf(address account) external view returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "event Transfer(address indexed _from, address indexed _to, uint256 _value)",
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function decimals() public view returns (uint8)"
];
// v3
exports.NonfungibleTokenPositionManager = [
    "event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
    "event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)",
    "event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)",
    "function positions(uint256 tokenId) external view returns (uint96 nonce,address operator,address token0,address token1,uint24 fee,int24 tickLower,int24 tickUpper,uint128 liquidity,uint256 feeGrowthInside0LastX128,uint256 feeGrowthInside1LastX128,uint128 tokensOwed0,uint128 tokensOwed1)",
    "function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)) external returns (uint256 amount0, uint256 amount1)",
    "function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max)) external returns (uint256 amount0, uint256 amount1)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function multicall(bytes[] data) public returns (bytes[] memory results)",
    "function totalSupply() public view returns (uint256)",
];
exports.Pool = [
    "function liquidity() external view returns (uint128)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
    "function fee() external view returns (uint24)",
    "event Mint( address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)",
    "event Burn( address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1 )",
];
