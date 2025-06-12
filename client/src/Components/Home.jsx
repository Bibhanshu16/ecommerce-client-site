import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from './CartContext';
import { CheckCircle } from 'lucide-react'; // Icon for success state

function Home() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleAddToCart = (product) => {
    if (addedProductId === product.product_id) return; // Prevent spamming

    addToCart(product);
    setAddedProductId(product.product_id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Our Products</h2>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <li
            key={product.product_id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-5 flex flex-col justify-between"
          >
            {/* Image section */}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-xl mb-4 text-gray-500">
                No Image
              </div>
            )}

            {/* Info */}
            <div className="flex-grow">
              <h3 className="font-semibold text-lg mb-1 text-gray-900">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>

              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.compare_at_price}
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addedProductId === product.product_id}
                className={`relative flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95
                  ${addedProductId === product.product_id
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}
                  disabled:opacity-60 disabled:cursor-not-allowed
                `}
              >
                {addedProductId === product.product_id ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Added
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
