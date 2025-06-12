import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

axios.defaults.withCredentials = true;

const defaultProfileImage = 'http://localhost:5000/uploads/default-profile.jpg';

function UserPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', lastname: '', email: '', phone: '', password: '',
    address: '', country: 'India', state: '', city: '', pincode: '', gender: '',
  });

  useEffect(() => {
    axios.get('http://localhost:5000/auth/me')
      .then(res => {
        if (res.data.user) {
          setIsLoggedIn(true);
          setUser(res.data.user);
          setForm({
            name: res.data.user.name || '', 
            lastname: res.data.user.lastname || '',
            email: res.data.user.email || '', 
            phone: res.data.user.phone || '',
            password: '', 
            address: res.data.user.address || '',
            country: res.data.user.country || 'India', 
            state: res.data.user.state || '',
            city: res.data.user.city || '', 
            pincode: res.data.user.pincode || '',
            gender: res.data.user.gender || '',
          });
          if (res.data.user.photo) {
            setPreviewImage(`http://localhost:5000${res.data.user.photo}`);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleInput = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAuth = async e => {
    e.preventDefault();
    const url = isLoginMode ? 'login' : 'register';

    const payload = {
      name: form.name, lastname: form.lastname, email: form.email,
      phone: form.phone, password: form.password,
    };

    if (!isLoginMode) {
      Object.assign(payload, {
        address: form.address, country: form.country, state: form.state,
        city: form.city, pincode: form.pincode, gender: form.gender,
      });
    }

    try {
      await axios.post(`http://localhost:5000/auth/${url}`, payload);
      const profile = await axios.get('http://localhost:5000/profile');
      setUser(profile.data.user);
      setIsLoggedIn(true);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleLogout = async () => {
    await axios.get('http://localhost:5000/auth/logout');
    setIsLoggedIn(false);
    setUser(null);
    setForm({
      name: '', lastname: '', email: '', phone: '', password: '',
      address: '', country: 'India', state: '', city: '', pincode: '', gender: '',
    });
    setPhoto(null);
    setPreviewImage(null);
    setIsEditing(false);
  };

  const handleProfileUpdate = async e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val) fd.append(key, val);
    });
    if (photo) {
      fd.append('photo', photo);
    }

    try {
      await axios.put('http://localhost:5000/profile', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const profile = await axios.get('http://localhost:5000/profile');
      setUser(profile.data.user);
      setPhoto(null);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await axios.delete('http://localhost:5000/profile/photo');
      const profile = await axios.get('http://localhost:5000/profile');
      setUser(profile.data.user);
      setPreviewImage(null);
      setPhoto(null);
      setShowImageMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove image');
    }
  };

  // Tailwind classes for reusable components
  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600";
  const btnPrimary = "px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-600";
  const btnSecondary = "px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-xl bg-white rounded-xl shadow-lg p-4 md:p-6 relative">
        {!isLoggedIn ? (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-center mb-4">
              {isLoginMode ? 'Login' : 'Register'}
            </h2>
            <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
              {!isLoginMode && (
                <>
                  <input name="name" placeholder="First Name" onChange={handleInput} value={form.name} className={inputClass} required />
                  <input name="lastname" placeholder="Last Name" onChange={handleInput} value={form.lastname} className={inputClass} required />
                  <input name="phone" placeholder="Phone" onChange={handleInput} value={form.phone} className={inputClass} required />
                </>
              )}
              <input name="email" type="email" placeholder="Email" onChange={handleInput} value={form.email} className={inputClass} required />
              <input name="password" type="password" placeholder="Password" onChange={handleInput} value={form.password} className={inputClass} required={!isLoginMode} />
              <button type="submit" className={`${btnPrimary} w-full`}>
                {isLoginMode ? 'Login' : 'Register'}
              </button>
            </form>
            <p className="text-center mt-4 text-sm">
              {isLoginMode ? 'New user?' : 'Already have an account?'}{' '}
              <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-500 hover:underline">
                {isLoginMode ? 'Register here' : 'Login here'}
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-4 md:mb-6 relative">
              <div className="relative">
                <img
                  src={previewImage || (user.photo ? `http://localhost:5000${user.photo}` : defaultProfileImage)}
                  alt="Profile"
                  onClick={() => setShowImageMenu(prev => !prev)}
                  className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-gray-300 cursor-pointer"
                />
                {showImageMenu && (
                  <div className="absolute z-10 top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border rounded shadow-md w-32">
                    <button
                      onClick={() => {
                        fileInputRef.current.click();
                        setShowImageMenu(false);
                      }}
                      className="w-full px-3 py-2 hover:bg-gray-100 text-left text-sm"
                    >
                      Change Image
                    </button>
                    {user.photo && (
                      <button
                        onClick={handleRemoveImage}
                        className="w-full px-3 py-2 hover:bg-gray-100 text-left text-sm text-red-600"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <h2 className="text-lg md:text-xl font-bold mt-2">{user.name} {user.lastname}</h2>
              <p className="text-xs md:text-sm text-gray-600">{user.email}</p>
            </div>

            {!isEditing ? (
              <>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-800">
                  <p><strong>Phone:</strong> {user.phone || 'Not specified'}</p>
                  <p><strong>Gender:</strong> {user.gender || 'Not specified'}</p>
                  <p><strong>Address:</strong> {user.address || 'Not specified'}</p>
                  <p><strong>City:</strong> {user.city || 'Not specified'}</p>
                  <p><strong>State:</strong> {user.state || 'Not specified'}</p>
                  <p><strong>Country:</strong> {user.country || 'Not specified'}</p>
                  <p><strong>Pincode:</strong> {user.pincode || 'Not specified'}</p>
                </div>
                <div className="flex justify-between mt-4 md:mt-6 space-x-2">
                  <button
                    onClick={() => {
                      setForm({ 
                        ...form, 
                        ...user, 
                        password: '',
                        name: user.name || '',
                        lastname: user.lastname || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || '',
                        country: user.country || 'India',
                        state: user.state || '',
                        city: user.city || '',
                        pincode: user.pincode || '',
                        gender: user.gender || ''
                      });
                      setIsEditing(true);
                    }}
                    className={`${btnPrimary} flex-1`}
                  >
                    Edit Profile
                  </button>
                  <button onClick={handleLogout} className={`${btnSecondary} flex-1`}>Logout</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-3 md:space-y-4 mt-2 md:mt-4" encType="multipart/form-data">
                <input name="name" placeholder="First Name" value={form.name || ''} onChange={handleInput} className={inputClass} />
                <input name="lastname" placeholder="Last Name" value={form.lastname || ''} onChange={handleInput} className={inputClass} />
                <input name="email" placeholder="Email" type="email" value={form.email || ''} onChange={handleInput} className={inputClass} />
                <input name="phone" placeholder="Phone" value={form.phone || ''} onChange={handleInput} className={inputClass} />
                <select name="gender" value={form.gender || ''} onChange={handleInput} className={inputClass}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input name="address" placeholder="Address" value={form.address || ''} onChange={handleInput} className={inputClass} />
                <input 
                  name="country" 
                  value={form.country || 'India'} 
                  readOnly 
                  className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                />
                <input name="state" placeholder="State" value={form.state || ''} onChange={handleInput} className={inputClass} />
                <input name="city" placeholder="City" value={form.city || ''} onChange={handleInput} className={inputClass} />
                <input name="pincode" placeholder="Pincode" value={form.pincode || ''} onChange={handleInput} className={inputClass} />

                <div className="flex justify-between space-x-2">
                  <button type="submit" className={`${btnPrimary} flex-1`}>Save</button>
                  <button type="button" onClick={() => {
                    setIsEditing(false);
                    setPhoto(null);
                    setPreviewImage(user.photo ? `http://localhost:5000${user.photo}` : null);
                  }} className={`${btnSecondary} flex-1`}>Cancel</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserPortal;