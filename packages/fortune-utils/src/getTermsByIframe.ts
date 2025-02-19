;`<iframe id="api_iframe_bmcx" name="api_iframe_bmcx" src="" width="800" height="800" scrolling="no" frameborder="0"></iframe>
<script type="text/javascript">
//接口生成：https://www.bmcx.com/api/
document.getElementById("api_iframe_bmcx").src = "https://www.bmcx.com/apiiframe/?api_from=bmcx&api_url=https://jieqi.bmcx.com/&api_width=98%&api_backgroundcolor=FFFFFF&api_navigation=no";
</script>`

export function getSolarTerms(year: number) {
  const iframe = document.createElement('iframe')
  iframe.id = 'api_iframe_bmcx'
  iframe.src = 'https://www.bmcx.com/apiiframe/?api_from=bmcx&api_url=https://jieqi.bmcx.com/&api_width=98%&api_backgroundcolor=FFFFFF&api_navigation=no'
  document.body.appendChild(iframe)

  iframe.onload = () => {
    const iframeWindow = iframe.contentWindow
  }
}
