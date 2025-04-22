//changes the background images based on the mood selection
function updateBackground(mood) {
	const bgImage = document.querySelector(".background-image img");
	const isDesktop = window.innerWidth >= 768;
  
	const moodImages = {
	  cozyjazz: isDesktop ? "cozyjazz-bg.jpg" : "cozyjazz.jpg",
	  rainyday: isDesktop ? "rainyday-bg.jpg" : "rainyday.jpg",
	  lofi: isDesktop ? "lofi-bg.jpg" : "lofi.jpg",
	  stressfree: isDesktop ? "stressfree-bg.jpg" : "stressfree.jpg",
	  whitenoise: isDesktop ? "whitenoise-bg.jpg" : "whitenoise.jpg",
	  default: "default-img.jpg"
	};
  
	if (bgImage) {
	  const selectedImage = moodImages[mood] || moodImages.default;
	  bgImage.src = `assets/images/${selectedImage}`;
	}
}

//Intro (#about-app) page display
window.addEventListener("DOMContentLoaded", ()=>{
	const aboutPage = document.getElementById("about-page");
	const startButton = document.getElementById("start-app");

	//show about page on first load
	aboutPage.style.display="block";
	startButton.style.display="block";

	//hide about page on button click
	startButton.addEventListener("click", ()=>{
		aboutPage.style.display="none";
		startButton.style.display="none";
	});
});