// src/pages/EditProduct.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Ajuste o caminho do import caso o arquivo api.ts esteja em outro lugar
import API from '../api/api'; 
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setFormData({
          name: data.name,
          price: data.price,
          category: data.category || '',
          stock: data.stock,
          description: data.description || ''
        });
        // Se a URL já for completa (do Cloudinary), usa ela diretamente
        setPreview(data.imageUrl);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar dados do produto.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    // Adiciona os campos de texto ao FormData
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value as string);
    });
    
    // Adiciona a imagem se uma nova foi selecionada
    if (image) {
      data.append('image', image);
    }

    try {
      await API.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Produto atualizado com sucesso!");
      navigate('/admin'); // Redireciona para o painel após sucesso
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o produto.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-500">A carregar dados...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900 transition"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black mb-6 text-gray-900">Editar Produto</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome do Produto" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Preço" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
            <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Categoria" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
            <input name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="Stock" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" required />
          </div>
          
          <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Descrição" className="w-full p-3 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-purple-500 outline-none" />

          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Imagem do Produto</label>
            <div className="flex items-center gap-4">
              {preview && <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />}
              <label className="cursor-pointer bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition">
                <Upload size={18} /> <span>Trocar imagem</span>
                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            </div>
          </div>

          <button 
            disabled={saving}
            type="submit" 
            className="w-full bg-mayitec-purple text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:opacity-90 transition disabled:opacity-50 mt-6"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} 
            {saving ? 'A guardar...' : 'Guardar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;