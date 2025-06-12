import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [categories, setCategories] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [clickedCategory, setClickedCategory] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const navRef = useRef();
  const searchInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setHoveredCategory(null);
        setClickedCategory(null);
        setShowMobileMenu(false);
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Focus search input when search is shown
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    // Generate search suggestions when query changes
    if (searchQuery.trim() === '') {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = [];
    const query = searchQuery.toLowerCase();

    // Search in categories
    Object.keys(categories).forEach(category => {
      if (category.toLowerCase().includes(query)) {
        suggestions.push({
          type: 'category',
          name: category,
          path: `/search/${category}`
        });
      }

      // Search in subcategories
      categories[category].forEach(subcategory => {
        if (subcategory.toLowerCase().includes(query)) {
          suggestions.push({
            type: 'subcategory',
            name: subcategory,
            path: `/search/${subcategory}`,
            parentCategory: category
          });
        }
      });
    });

    setSearchSuggestions(suggestions);
  }, [searchQuery, categories]);

  useEffect(() => {
    // Fetch categories and subcategories from your backend
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/categories');
        if (response.ok) {
          const data = await response.json();
          
          // Transform the data into the format your navbar expects
          const formattedCategories = {};
          data.forEach(category => {
            formattedCategories[category.name] = category.subcategories.map(
              sub => sub.name
            );
          });
          
          setCategories(formattedCategories);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) { // Only for desktop
      setHoveredCategory(null);
    }
  };

  const handleCategoryInteraction = (cat) => {
    if (window.innerWidth > 768) {
      // Desktop behavior - hover
      setHoveredCategory(cat);
      setClickedCategory(null);
    } else {
      // Mobile behavior - click
      setClickedCategory(clickedCategory === cat ? null : cat);
      setHoveredCategory(null);
    }
    setShowSearch(false); // Close search when interacting with categories
  };

  const handleTypeClick = (type) => {
    setHoveredCategory(null);
    setClickedCategory(null);
    setShowMobileMenu(false);
    navigate(`/search/${type}`);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setClickedCategory(null); // Close category menu when mobile menu toggles
    setShowSearch(false); // Close search when mobile menu toggles
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setShowMobileMenu(false); // Close mobile menu when search toggles
    setClickedCategory(null); // Close category menu when search toggles
    setSearchQuery(''); // Reset search query when toggling
    setSearchSuggestions([]); // Clear suggestions when toggling
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(suggestion.path);
    setSearchQuery('');
    setShowSearch(false);
    setSearchSuggestions([]);
  };

  // Determine which category to show (hover for desktop, click for mobile)
  const activeCategory = window.innerWidth > 768 ? hoveredCategory : clickedCategory;

  return (
    <div
      ref={navRef}
      onMouseLeave={handleMouseLeave}
      className="transition-all duration-300 ease-in-out bg-white shadow-md pb-4"
    >
      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left: Search button (hidden on mobile) */}
        <div className="hidden md:block">
          <button
            onClick={toggleSearch}
            className="text-gray-700 hover:text-blue-500 font-medium"
          >
            <span className="material-symbols-rounded">search</span>
          </button>
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center">
          <h1 className="font-[cursive] text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            MAKE.IT.NUZI
          </h1>
        </div>

        {/* Right: Desktop Navigation (hidden on mobile) */}
        <nav className="hidden md:flex space-x-4">
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-500 font-medium"
          >
            <span className="material-symbols-rounded">home</span>
          </Link>
          <Link
            to="/cart"
            className="text-gray-700 hover:text-blue-500 font-medium"
          >
            <span className="material-symbols-rounded">shopping_cart</span>
          </Link>
          <Link 
            to="/userPortal"
            className="text-gray-700 hover:text-blue-500 font-medium">
            <span className="material-symbols-outlined">person</span>
          </Link>
        </nav>

        {/* Mobile Menu Button (visible on mobile) - MOVED TO RIGHT SIDE */}
        <div className="flex md:hidden gap-4">
          <button 
            onClick={toggleSearch}
            className="text-gray-700 hover:text-blue-500"
          >
            <span className="material-symbols-rounded">search</span>
          </button>
          <button 
            onClick={toggleMobileMenu}
            className="text-gray-700 hover:text-blue-500"
          >
            <span className="material-symbols-rounded">
              {showMobileMenu ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar (shown when search is toggled) */}
      {showSearch && (
        <div className="px-4 py-2 bg-white border-t border-gray-200 relative">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, categories..."
              className="flex-1 border border-gray-300 rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors"
            >
              <span className="material-symbols-rounded">search</span>
            </button>
          </form>
          
          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50">
              <ul className="py-1">
                {searchSuggestions.map((suggestion, index) => (
                  <li 
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  >
                    <span className="material-symbols-rounded text-gray-500 mr-2">
                      {suggestion.type === 'category' ? 'category' : 'label'}
                    </span>
                    <div>
                      <div className="font-medium">{suggestion.name}</div>
                      {suggestion.type === 'subcategory' && (
                        <div className="text-xs text-gray-500">{suggestion.parentCategory}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex flex-col space-y-3">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-500 font-medium flex items-center"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-rounded mr-2">home</span>
              Home
            </Link>
            <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-500 font-medium flex items-center"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-rounded mr-2">shopping_cart</span>
              Cart
            </Link>
            <Link 
              to="/userPortal"
              className="text-gray-700 hover:text-blue-500 font-medium flex items-center"
              onClick={() => setShowMobileMenu(false)}
            >
              <span className="material-symbols-outlined mr-2">person</span>
              Profile
            </Link>
          </div>
        </div>
      )}

      {/* Categories (under title) */}
      <div className="text-center mt-2 flex justify-center gap-4 md:gap-8 overflow-x-auto py-2 px-2">
        {Object.keys(categories).map((cat) => (
          <div
            key={cat}
            onMouseEnter={() => window.innerWidth > 768 && setHoveredCategory(cat)}
            onClick={() => handleCategoryInteraction(cat)}
            className="cursor-pointer text-gray-700 hover:text-blue-500 whitespace-nowrap px-2"
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Subcategories (under categories) */}
      {activeCategory && categories[activeCategory] && (
        <div className="flex justify-center mt-2">
          <div className="bg-white border shadow px-4 py-2 md:px-6 md:py-3 rounded">
            <div className="flex gap-2 md:gap-4 flex-wrap justify-center">
              {categories[activeCategory].map((type) => (
                <div
                  key={type}
                  onClick={() => handleTypeClick(type)}
                  className="cursor-pointer text-gray-600 hover:text-blue-600 text-sm md:text-base px-2 py-1"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;