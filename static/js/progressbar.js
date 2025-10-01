window.onload = () => {
  if(document.getElementById("progress-bar") === null){
    return
  };
  const post = document.getElementsByTagName("article")[0];
  const progressBar = document.getElementById("progress-bar");
  const distance = post.clientHeight + post.offsetTop - window.innerHeight;

  window.addEventListener("scroll", () => {
    const progress = (window.scrollY / distance) * 100;
    progressBar.style.width = `${progress}%`;
  });
};
