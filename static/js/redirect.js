window.addEventListener("load", () => {
  document.body.addEventListener("click", function (e) {
    let target = e.target;
    if (
      target &&
      target.nodeName === "A" &&
      !target.classList.contains("redirect-button") &&
      target.hostname !== window.location.hostname
    ) {
      e.preventDefault();
      let encodedUrl = btoa(target.href);
      window.open("/blog/redirect?target=" + encodedUrl, "_self");
    }
  });
});
