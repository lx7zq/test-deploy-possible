import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdWarning, MdAccessTime, MdError, MdHourglassEmpty, MdInfo } from 'react-icons/md';

const CardProduct = ({ product }) => {
  const navigate = useNavigate();
  const [originalStatuses, setOriginalStatuses] = useState([]);

  // ฟังก์ชันสำหรับกำหนดสี, ไอคอน, gradient ตามสถานะ (modern badge)
  const getStatusStyle = (statusName) => {
    switch (statusName) {
      case 'สินค้าใกล้หมด':
        return {
          bg: 'linear-gradient(90deg, #FFD600 0%, #FFF176 100%)',
          text: '#222',
          icon: <MdWarning style={{ color: '#222', fontSize: '1.2em', marginRight: 6 }} />
        };
      case 'สินค้าใกล้หมดอายุ':
        return {
          bg: 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)',
          text: '#fff',
          icon: <MdAccessTime style={{ color: '#fff', fontSize: '1.2em', marginRight: 6 }} />
        };
      case 'สินค้าหมด':
        return {
          bg: 'linear-gradient(90deg, #D32F2F 0%, #FF5252 100%)',
          text: '#fff',
          icon: <MdError style={{ color: '#fff', fontSize: '1.2em', marginRight: 6 }} />
        };
      case 'หมดอายุ':
        return {
          bg: 'linear-gradient(90deg, #7B1FA2 0%, #B39DDB 100%)',
          text: '#fff',
          icon: <MdHourglassEmpty style={{ color: '#fff', fontSize: '1.2em', marginRight: 6 }} />
        };
      default:
        return {
          bg: 'linear-gradient(90deg, #BDBDBD 0%, #EEEEEE 100%)',
          text: '#222',
          icon: <MdInfo style={{ color: '#222', fontSize: '1.2em', marginRight: 6 }} />
        };
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-4 w-[192px] h-[250px] text-center pb-16">
      <div className="relative -mt-16">
        <img
          src={product.productImage}
          alt={product.productName}
          className="w-40 h-40 mx-auto"
        />
      </div>
      <h2
        className="text-sm font-semibold text-black mt-2 break-words whitespace-nowrap px-2 overflow-hidden text-ellipsis"
        style={{
          maxWidth: '100%',
          cursor: 'pointer'
        }}
        title={product.productName}
      >
        {product.productName}
      </h2>
      <div className="mt-auto w-full">
        <p className="text-purple-500 text-sm font-bold">
          ฿ {product.sellingPricePerUnit}
        </p>
        <p className="text-gray-700 text-xs">มีอยู่ {product.quantity}</p>
        {product.productStatuses && product.productStatuses.length > 0 && (
          <div className="flex flex-row flex-wrap justify-center items-center gap-2 mt-1 mb-4">
            {product.productStatuses
              .filter(status => ['สินค้าใกล้หมด', 'สินค้าใกล้หมดอายุ', 'สินค้าหมด', 'หมดอายุ'].includes(status.statusName))
              .map((status, index) => {
                const style = getStatusStyle(status.statusName);
                return (
                  <span
                    key={index}
                    className="px-3 py-1 text-xs rounded-full shadow-md flex items-center gap-1"
                    style={{
                      background: style.bg,
                      color: style.text,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                      boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                      border: 'none',
                      minWidth: 0,
                      maxWidth: 140,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={status.statusName}
                  >
                    {style.icon}
                    <span className="truncate">{status.statusName}</span>
                  </span>
                );
              })}
          </div>
        )}
      </div>
      {/* Footer  */}
      <div
        className="absolute bottom-0 left-0 w-full bg-[#EA7C69]  bg-opacity-20 text-[#EA7C69] font-semibold text-center rounded-b-2xl shadow-md"
        onClick={() => navigate(`/products/edit-product/${product._id}`)}
      >
        <button className="flex items-center justify-center w-full py-2 transition-all duration-300 hover:bg-opacity-80">
          ✏️ Edit Product
        </button>
      </div>
    </div>
  );
};

export default CardProduct;
