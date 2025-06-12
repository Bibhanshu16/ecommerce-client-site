import React from 'react';

function Contactheader() {
  return (
    <header className="bg-white px-1 w-full border-b border-gray-300">
      <ul className="flex justify-end list-none m-0 p-0">
        <li className="ml-2 md:ml-4">
          <a href="https://www.instagram.com/make.it.nuzi/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-pink-600 transition-colors">
            <i className="fab fa-instagram text-xl md:text-2xl"></i>
          </a>
        </li>
        <li className="ml-2 md:ml-4">
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 transition-colors">
            <i className="fab fa-linkedin text-xl md:text-2xl"></i>
          </a>
        </li>
      </ul>
    </header>
  );
}

export default Contactheader;