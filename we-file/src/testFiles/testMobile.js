export const testMobile = () => {
  const script = document.createElement('script')
  script.src = `http://${document.domain}:8090/target/target-script-min.js#anonymous`
  document.body.appendChild(script)
}
