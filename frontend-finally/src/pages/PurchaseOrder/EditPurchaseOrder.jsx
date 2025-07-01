import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import purchaseOrderService from "../../services/purchaseOrder.service";
import productService from "../../services/product.service";
import supplierService from "../../services/supplier.service";
import ProductList from "../../components/PurchaseOrder/ProductList";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import useAuthStore from "../../store/useAuthStore";
import { ProductContext } from "../../context/ProductContext";

const EditPurchaseOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuthStore();
  const { products, setProducts } = useContext(ProductContext);
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    supplierId: "",
    purchaseOrderDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const [productsResponse, suppliersResponse, purchaseOrderResponse] =
        await Promise.all([
          productService.getAllProducts(),
          supplierService.getAllSuppliers(),
          purchaseOrderService.getPurchaseOrderById(id),
        ]);

      console.log('Products Response:', productsResponse);
      console.log('Purchase Order Response:', purchaseOrderResponse);

      const formattedProducts = Array.isArray(productsResponse)
        ? productsResponse
        : productsResponse.products || [];

      const formattedSuppliers = Array.isArray(suppliersResponse)
        ? suppliersResponse
        : suppliersResponse.suppliers || [];

      setProducts(formattedProducts);
      setSuppliers(formattedSuppliers);

      // ตั้งค่าข้อมูลใบสั่งซื้อ
      if (purchaseOrderResponse.supplierId) {
        setFormData({
          supplierId:
            purchaseOrderResponse.supplierId._id ||
            purchaseOrderResponse.supplierId,
          purchaseOrderDate: new Date(purchaseOrderResponse.purchaseOrderDate)
            .toISOString()
            .split("T")[0],
        });
      }

      // ตั้งค่ารายการสินค้า
      const formattedSelectedProducts = purchaseOrderResponse.products.map((product) => {
        console.log('Processing product:', product);
        return {
          productId: product.productId._id || product.productId,
          productName: product.productName,
          quantity: product.quantity,
          purchasePrice: product.purchasePrice,
          sellingPricePerUnit: product.sellingPricePerUnit,
          pack: Boolean(product.pack),
          expirationDate: product.expirationDate
            ? new Date(product.expirationDate).toISOString().split("T")[0]
            : "",
          subtotal: product.quantity * product.purchasePrice,
        };
      });

      console.log('Formatted Selected Products:', formattedSelectedProducts);
      setSelectedProducts(formattedSelectedProducts);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลได้",
      });
    }
  };

  const handleAddProduct = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      const existingProduct = selectedProducts.find(
        (p) => p.productId === productId
      );
      if (existingProduct) {
        Swal.fire({
          icon: "warning",
          title: "แจ้งเตือน",
          text: "สินค้านี้ถูกเพิ่มในรายการแล้ว",
        });
        return;
      }
      setSelectedProducts((prev) => [
        ...prev,
        {
          productId: product._id,
          productName: product.productName,
          quantity: 1,
          purchasePrice: product.purchasePrice || 0,
          sellingPricePerUnit: product.sellingPricePerUnit,
          pack: false,
          expirationDate: "",
          subtotal: product.purchasePrice || 0,
        },
      ]);
    }
  };

  const handleQuantityChange = (index, value) => {
    const newQuantity = parseInt(value) || 0;
    if (newQuantity <= 0) {
      setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
    } else {
      setSelectedProducts((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          quantity: newQuantity,
          subtotal: newQuantity * updated[index].purchasePrice,
        };
        return updated;
      });
    }
  };

  const toggleUnit = (index) => {
    console.log('Toggle unit called for index:', index);
    console.log('Current selectedProducts:', selectedProducts);
    
    setSelectedProducts((prev) => {
      console.log('Previous state:', prev);
      const updated = [...prev];
      const newPack = !updated[index].pack;
      console.log('New pack value:', newPack);
      
      const product = products.find(p => p._id === updated[index].productId || p.id === updated[index].productId);
      console.log('Found product:', product);
      
      if (product) {
        const purchasePrice = newPack ? product.purchasePrice * product.packSize : product.purchasePrice;
        const sellingPricePerUnit = newPack ? product.sellingPricePerPack : product.sellingPricePerUnit;
        
        updated[index] = {
          ...updated[index],
          pack: newPack,
          purchasePrice: purchasePrice,
          sellingPricePerUnit: sellingPricePerUnit,
          subtotal: updated[index].quantity * purchasePrice
        };
        
        console.log('Updated product:', updated[index]);
      } else {
        console.error('Product not found:', {
          productId: updated[index].productId,
          availableProducts: products.map(p => ({ id: p._id || p.id, name: p.productName }))
        });
      }
      
      console.log('New state:', updated);
      return updated;
    });
  };

  const handleExpirationDateChange = (index, date) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        expirationDate: date,
      };
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณาเข้าสู่ระบบก่อนทำรายการ",
      });
      return;
    }

    if (!formData.supplierId) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณาเลือกซัพพลายเออร์",
      });
      return;
    }

    if (selectedProducts.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ",
      });
      return;
    }

    const invalidProducts = selectedProducts.filter(
      (product) => !product.quantity || !product.purchasePrice
    );

    if (invalidProducts.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณากรอกจำนวนและราคาซื้อให้ครบถ้วน",
      });
      return;
    }

    setLoading(true);
    try {
      const purchaseOrderData = {
        supplierId: formData.supplierId,
        purchaseOrderDate:
          formData.purchaseOrderDate || new Date().toISOString(),
        products: selectedProducts.map((product) => ({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          purchasePrice: product.purchasePrice,
          sellingPricePerUnit: product.sellingPricePerUnit,
          subtotal: product.quantity * product.purchasePrice,
          pack: Boolean(product.pack),
          expirationDate: product.expirationDate,
        })),
        userId: user._id,
      };

      await purchaseOrderService.updatePurchaseOrder(id, purchaseOrderData);
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "แก้ไขใบสั่งซื้อสำเร็จ",
      }).then(() => {
        navigate("/purchase-orders");
      });
    } catch (error) {
      console.error("Error updating purchase order:", error);
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: error.response?.data?.message || "ไม่สามารถแก้ไขใบสั่งซื้อได้",
      });
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                แก้ไขใบสั่งซื้อ #{id}
              </h1>
              <p className="text-gray-500 mt-1">แก้ไขข้อมูลใบสั่งซื้อ</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">วันที่</div>
              <div className="text-lg font-semibold text-gray-800">
                {new Date().toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* รายการสินค้าทั้งหมด */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-[calc(100vh-300px)] overflow-y-auto">
                <ProductList
                  products={filteredProducts}
                  onAdd={handleAddProduct}
                />
              </div>
            </div>
          </div>

          {/* รายการที่เลือก */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-[60vh] lg:h-[75vh] flex flex-col">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือกซัพพลายเออร์
                </label>
                <select
                  id="edit-po-supplier-select"
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                >
                  <option value="">เลือกซัพพลายเออร์</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.companyName ||
                        supplier.supplierName ||
                        supplier.name ||
                        "ไม่ระบุชื่อ"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {selectedProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">
                        {product.productName}
                      </h3>
                      <button
                        onClick={() =>
                          setSelectedProducts((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <label className="block text-sm text-gray-600 mb-1">
                          ราคาซื้อ
                        </label>
                        <input
                          type="number"
                          id={`edit-po-purchaseprice-input-${index}`}
                          value={product.purchasePrice || ""}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setSelectedProducts((prev) => {
                              const updated = [...prev];
                              updated[index] = {
                                ...updated[index],
                                purchasePrice: value,
                                subtotal: value * updated[index].quantity,
                              };
                              return updated;
                            });
                          }}
                          placeholder="0.00"
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-sm text-gray-600 mb-1">
                          จำนวน
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(index, product.quantity - 1)
                            }
                            className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={product.quantity}
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            className="w-20 text-center p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(index, product.quantity + 1)
                            }
                            className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              console.log('Button clicked for index:', index);
                              console.log('Current product:', product);
                              toggleUnit(index);
                            }}
                            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                              product.pack
                                ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {product.pack ? "แพ็ค" : "ชิ้น"}
                          </button>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <label className="block text-sm text-gray-600 mb-1">
                          วันหมดอายุ
                        </label>
                        <input
                          type="date"
                          value={product.expirationDate || ""}
                          onChange={(e) =>
                            handleExpirationDateChange(index, e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="col-span-12">
                        <div className="text-right font-medium text-gray-800">
                          รวม:{" "}
                          {(
                            product.quantity * (product.purchasePrice || 0)
                          ).toLocaleString()}{" "}
                          ฿
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedProducts.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-700">
                        ยอดรวมทั้งสิ้น
                      </span>
                      <span className="text-2xl font-bold text-gray-800">
                        {selectedProducts
                          .reduce(
                            (sum, product) =>
                              sum +
                              product.quantity * (product.purchasePrice || 0),
                            0
                          )
                          .toLocaleString()}{" "}
                        ฿
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-between gap-4">
                <button
                  id="edit-po-cancel-button"
                  onClick={() => navigate("/purchase-orders")}
                  className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  id="edit-po-submit-button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกใบสั่งซื้อ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPurchaseOrder;
