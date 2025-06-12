import React, { useState } from 'react';
import { useCart } from './CartContext';
import { Minus, Plus, Trash2, Bookmark, ShoppingCart } from 'lucide-react';

function Cart() {
  const {
    cartItems,
    savedItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    moveToSaved,
    moveToCart,
  } = useCart();

  const [email, setEmail] = useState('');
  const [txnId, setTxnId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const upiId = '9770711522@fam';

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const handlePaymentConfirmation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const orderDetails = {
      email,
      txnId,
      total: totalPrice,
      items: cartItems.map(({ name, price, quantity }) => ({
        name,
        price,
        quantity,
      })),
    };

    try {
      const res = await fetch('http://localhost:5000/api/products/manual-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      const data = await res.json();
      setMessage(data.message || '✅ Order confirmed successfully!');
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      setMessage('❌ Error confirming your order. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-white min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">🛒 Your Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">Your cart is empty.</p>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {cartItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-md"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                <p className="text-gray-600">
                  ₹{item.price} × {item.quantity || 1} = ₹
                  {(item.price * (item.quantity || 1)).toFixed(2)}
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => decreaseQuantity(item.product_id)}
                    className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium">{item.quantity || 1}</span>
                  <button
                    onClick={() => increaseQuantity(item.product_id)}
                    className="bg-gray-200 p-1 rounded-full hover:bg-gray-300"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => removeFromCart(item.product_id)}
                  className="text-red-600 hover:text-red-800"
                  title="Remove"
                >
                  <Trash2 />
                </button>
                <button
                  onClick={() => moveToSaved(item.product_id)}
                  className="text-yellow-600 hover:text-yellow-800"
                  title="Save for later"
                >
                  <Bookmark />
                </button>
              </div>
            </div>
          ))}

          <div className="text-right mt-6">
            <p className="text-xl font-bold text-gray-800">
              Total: ₹{totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Saved Items */}
      {savedItems.length > 0 && (
        <div className="max-w-3xl mx-auto mt-12">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">🔖 Saved for Later</h3>
          <div className="space-y-3">
            {savedItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-gray-900 font-semibold">{item.name}</h4>
                  <p className="text-gray-600 text-sm">₹{item.price}</p>
                </div>
                <button
                  onClick={() => moveToCart(item.product_id)}
                  className="text-green-600 hover:text-green-800"
                  title="Move to Cart"
                >
                  <ShoppingCart />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Section */}
      {cartItems.length > 0 && (
        <div className="mt-10 max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">🔐 Complete Your Purchase</h3>

          <p className="mb-2 text-gray-700">
            <strong>Step 1:</strong> Scan the QR and pay ₹{totalPrice.toFixed(2)} to:
          </p>
          <div className="bg-gray-100 p-3 rounded-md font-mono text-blue-600 mb-4">
            {upiId}
          </div>

          <div className="flex justify-center mb-6">
            <img
              src="/qr.png"
              alt="UPI QR Code"
              className="w-52 h-52 border border-gray-300 rounded-xl"
            />
          </div>

          <p className="mb-4 text-gray-600">
            After payment, fill the form below to confirm your order:
          </p>

          <form onSubmit={handlePaymentConfirmation} className="space-y-4">
            <input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Transaction ID"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Payment'}
            </button>

            {message && (
              <p className="text-center text-lg font-medium mt-4 text-green-600">{message}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default Cart;
