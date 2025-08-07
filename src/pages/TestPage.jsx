const TestPage = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tailwind CSS 테스트
        </h1>
        <p className="text-gray-600 mb-4">
          이 텍스트가 올바르게 스타일되어 보인다면 Tailwind CSS가 작동하고
          있습니다.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          테스트 버튼
        </button>
      </div>
    </div>
  );
};

export default TestPage;
