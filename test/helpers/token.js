export default function token (n) {
  return parseInt(web3.fromWei(n, "ether"));
}
