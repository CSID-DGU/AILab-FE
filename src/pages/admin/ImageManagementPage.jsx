import React, { useState, useEffect } from 'react';
import { getImages, createImage } from '../../services/imageService';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Alert from '../../components/UI/Alert';
import Badge from '../../components/UI/Badge';

const ImageManagementPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    imageName: '',
    imageVersion: '',
    cudaVersion: '',
    description: ''
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const result = await getImages();
      if (result.success) {
        setImages(result.data);
      } else {
        setAlert({
          type: 'error',
          message: result.error
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: '이미지 목록을 불러오는데 실패했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateImage = async (e) => {
    e.preventDefault();
    
    // 폼 유효성 검사
    if (!formData.imageName || !formData.imageVersion || !formData.cudaVersion || !formData.description) {
      setAlert({
        type: 'error',
        message: '모든 필드를 입력해주세요.'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createImage(formData);
      if (result.success) {
        setAlert({
          type: 'success',
          message: '이미지가 성공적으로 생성되었습니다.'
        });
        setFormData({
          imageName: '',
          imageVersion: '',
          cudaVersion: '',
          description: ''
        });
        setShowCreateForm(false);
        fetchImages(); // 목록 새로고침
      } else {
        setAlert({
          type: 'error',
          message: result.error
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: '이미지 생성 중 문제가 발생했습니다.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">이미지 관리</h1>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="primary"
        >
          {showCreateForm ? '취소' : '새 이미지 생성'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">새 이미지 생성</h2>
          <form onSubmit={handleCreateImage} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="이미지 이름"
                name="imageName"
                value={formData.imageName}
                onChange={handleInputChange}
                placeholder="예: cuda"
                required
              />
              <Input
                label="이미지 버전"
                name="imageVersion"
                value={formData.imageVersion}
                onChange={handleInputChange}
                placeholder="예: 12.4"
                required
              />
              <Input
                label="CUDA 버전"
                name="cudaVersion"
                value={formData.cudaVersion}
                onChange={handleInputChange}
                placeholder="예: 12.4"
                required
              />
            </div>
            <Input
              label="설명"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="이미지에 대한 설명을 입력하세요"
              required
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
              >
                {loading ? '생성 중...' : '생성'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowCreateForm(false)}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold mb-4">이미지 목록</h2>
        {loading && !showCreateForm ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 이미지가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이미지 이름
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    버전
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CUDA 버전
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {images.map((image) => (
                  <tr key={image.imageId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {image.imageId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {image.imageName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="blue">
                        {image.imageVersion}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="green">
                        CUDA {image.cudaVersion}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {image.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(image.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImageManagementPage;