import React, { useState, useRef } from 'react';
import API from '../api/api';
import { Upload, Loader2, Package, Image as ImageIcon, X } from 'lucide-react';

const AdminProductPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', stock: '', description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Referência para limpar o input de arquivo após o envio
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setFormData({ name: '', price: '', category: '', stock: '', description: '' });
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa o input visualmente
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));
    if (selectedFile) data.append('image', selectedFile);

    try {
      await API.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Produto adicionado com sucesso!');
      clearForm();
    } catch (error) {
      console.error(error);
      alert('Erro ao adicionar produto. Verifique as permissões.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-mayitec-purple/10 rounded-2xl text-mayitec-purple">
          <Package size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Adicionar Produto</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-6 hover:border-mayitec-purple transition-colors relative">
          {previewUrl ? (
            <div className="relative">
              <img src={previewUrl} alt="Preview" className="h-40 w-full object-contain mb-4 rounded-lg" />
              <button 
                type="button" 
                onClick={clearForm}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <ImageIcon size={48} className="text-gray-300 mb-2" />
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:bg-gray-100 file:hover:bg-gray-200 cursor-pointer" 
            required 
          />
        </div>

        {/* ... restante do formulário (inputs de nome, preço, etc) mantém-se igual ... */}
        <div className="grid md:grid-cols-2 gap-6">
          <input type="text" placeholder="Nome do Produto" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-mayitec-purple"
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          <input type="text" placeholder="Categoria" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-mayitec-purple"
            value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <input type="number" placeholder="Preço (AOA)" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-mayitec-purple"
            value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          <input type="number" placeholder="Quantidade em Stock" className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-mayitec-purple"
            value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
        </div>

        <textarea placeholder="Descrição detalhada do produto..." className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-mayitec-purple h-32"
          value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
        
        <button type="submit" disabled={loading} className="w-full bg-mayitec-purple text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
          {loading ? 'A processar...' : 'Publicar no Catálogo'}
        </button>
      </form>
    </div>
  );
};

export default AdminProductPage;