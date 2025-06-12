import React from 'react';

function DailyHeader() {
  const messages = [
    <>
      <span className="material-symbols-outlined mr-1">digital_wellbeing</span>
      Made with Heart, Worn with Love!
    </>,
    <>
      <span className="material-symbols-outlined mr-1">settings_accessibility</span>
      Every Piece Tells Your Story!
    </>,
    <>
      <span className="material-symbols-outlined align-middle mr-1">draw_collage</span>
      Crafted by Hand, Chosen by You!
    </>,
    <>
      <span className="material-symbols-outlined align-middle mr-1">volunteer_activism</span>
      From Our Hands to Your Heart!
    </>,
    <>
      <span className="material-symbols-outlined align-middle mr-1">family_home</span>
      Jewelry That Feels Like You!
    </>,
    <>
      <span className="material-symbols-outlined align-middle mr-1">diversity_4</span>
      One of a Kind, Just Like You!
    </>,
    <>
      <span className="material-symbols-outlined align-middle mr-1">cheer</span>
      Celebrate You, Every Day!
    </>
  ];

  const today = new Date().getDay();
  const todayMessage = messages[today];

  return (
    <header className="bg-green-800 text-center text-white text-sm md:text-base font-bold p-2 flex justify-center items-center">
      <div className="flex items-center">
        {todayMessage}
      </div>
    </header>
  );
}

export default DailyHeader;