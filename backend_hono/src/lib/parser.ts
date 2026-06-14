// 차후 리스트 형식으로 여러가지 리턴해서 쓸지, 아니면 당장필요한 컨텍윈도만 할지 고민할것
export function args_only(args: string){
  const index = args.indexOf("--ctx-size");
  if (index !== -1 && index + 1 < args.length) {
    const value = parseInt(args[index + 1], 10);
    return isNaN(value) ? null : value;
  }
  return null;
}