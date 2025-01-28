'use strict';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');

const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');

const openModal = function (e) {
  // next line to prevent page from get to start when click on btn of open which is link
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === Tabbed component

// tabs.forEach(t => t.addEventListener('click', function(){console.log('tab');}))
// it is bad code as if we have 200 component it will affect badly in performance , 
// instead that we use event delgation by giving the event to parent of elements

tabsContainer.addEventListener('click', function (e) {
  const clicked = e.target.closest('.operations__tab');

  // Guard clause
  // because of  when user click in region between button it give null
  if (!clicked) return;

  // Remove active classes
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Activate tab
  clicked.classList.add('operations__tab--active');

  // Activate content area
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === scrolling to function

btnScrollTo.addEventListener('click', function (e) {
  // === old methode
  // const section1Coordinates = section1.getBoundingClientRect();
  // window.scrollTo({
  //   left: section1Coordinates.left + window.pageXOffset,
  //   top: section1Coordinates.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  // === new methode
  section1.scrollIntoView({ behavior: 'smooth' });
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === Page navigation

// === old methode that is not best as we give AddEventListner many times equal to number of links that harm the performance

// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault();
//     const id = this.getAttribute('href');
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// === best methode called event delegation as we give AddEventLIstner one time to parent of element that improve the performance
// 1. Add event listener to common parent element
// 2. Determine what element originated the event

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  // Matching strategy that used to know which element of parent's element that was clicked
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href');
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === Menu animation

const handleHover = function (e) {
  // we used event delegation in next steps
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    // we used DOM traversing in 2 next steps
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    const logo = link.closest('.nav').querySelector('img');

    // 'this' keyword refere here to opacity
    siblings.forEach(el => {
      if (el !== link) el.style.opacity = this;
    });
    logo.style.opacity = this;
  }
};

// ======== Passing "argument" into handler
nav.addEventListener('mouseover', handleHover.bind(0.5));
nav.addEventListener('mouseout', handleHover.bind(1));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === Sticky navigation: Intersection Observer API

/* we determine header as we want events occure on navbar when header page move and near to disapear
fixed steps : const headerObserver = new IntersectionObserver(function,object)
              headerObserver.observe(header)  //header > which is the observed element;


*/
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height;

const stickyNav = function (entries) {
  const [entry] = entries;

  // we used next 2 lines of code as we want nav bar to disappear during the header page moving and reappear when header page disappear
  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
};

// we should pass 2 parameters function and object
const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0 /* the call back of function will occure when the 0% of target element will start or end to appear on view port */,
  rootMargin: `-${navHeight}px` /* we use this line as we want nav bar to appear at point that the remaining distance of header page to disappear
                                   is equal to the hight of nav bar as we want nav bar to appear before the content of next page start to appear */,
});

headerObserver.observe(header);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// === Reveal sections >> using Intersection Observer >> as sections go up as beautiful effect when scroll

// there is class that is be given to sections in css ".section--hidden"

const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  entry.target.classList.remove('section--hidden');
  observer.unobserve(
    entry.target
  ); /* we use that line to enhance performance as to apply effect only for first scrolling down */
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

// we use forEach as they are 4 sections
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add(
    'section--hidden'
  ); /* we use that line here instead write the class name in html file */
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* === Lazy loading images >> using that methode to improve performance as images has the biggest effect on performance so we have copy of 
                              each picture which is very low in size and used it in loading page then during scrolling we use observer methode 
                              to swape low quality picture by high and natural picture without user know 
*/

const imgTargets = document.querySelectorAll('img[data-src]');

const loadImg = function (entries, observer) {
  const [entry] = entries;

  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;

  /* we remove the blure effect by addEventListner because removig filter is very fast than swapping images so by this way blure won't remove
  untill loading event happen */
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});

imgTargets.forEach(img => imgObserver.observe(img));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ======= Slider

const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  // Functions
  const createDots = function () {
    slides.forEach(function (_, i) {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }

    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  // Event handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide();
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};
slider();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// ====================================================================================================================================
// ====================================================================================================================================
// ====================================================================================================================================
// ====================================================================================================================================
// ====================================================================================================================================

