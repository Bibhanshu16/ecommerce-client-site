import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { CheckCircle } from 'lucide-react';

function SearchResults() {
  const { query } = useParams();
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/products/search/${query}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching search results:', err);
      }
    };

    fetchResults();
  }, [query]);

  const handleAddToCart = (product) => {
    if (addedProductId === product.product_id) return;

    addToCart(product);
    setAddedProductId(product.product_id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        Showing results for: <span className="text-blue-600">{query}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.product_id} className="border rounded-2xl p-4 shadow bg-white flex flex-col justify-between">
              <img 
                src={product.image_url || 'https://via.placeholder.com/150'} 
                alt={product.name} 
                className="w-full h-48 object-cover mb-2 rounded-xl"
              />
              <div className="flex-grow">
                <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <p className="font-bold text-blue-600 mt-1 text-lg">₹{product.price}</p>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                disabled={addedProductId === product.product_id}
                className={`mt-4 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95
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
          ))
        ) : (
          <p className="text-gray-700">No products found for this query.</p>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
