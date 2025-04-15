function updateBackground(mood) {
	const bgImage = document.querySelector(".background-image img");
	const moodImages = {
	  cozyjazz: "assets/images/cozyjazz.jpg",
	  rainyday: "assets/images/rainyday.jpg",
	  lofi: "assets/images/lofi.jpg",
	  stressfree: "assets/images/stressfree.jpg",
	  whitenoise: "assets/images/whitenoise.jpg",
	  default: "assets/images/default-img.jpg"
	};
  
	if (bgImage) {
	  bgImage.src = moodImages[mood] || moodImages.default;
	}
  }