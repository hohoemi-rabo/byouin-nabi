interface RecommendedDepartmentsProps {
  departments: string[];
}

export default function RecommendedDepartments({ departments }: RecommendedDepartmentsProps) {
  return (
    <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-primary mb-4">
        推奨される診療科
      </h2>
      <p className="text-lg text-gray-700 mb-4">
        症状から、以下の診療科の受診をおすすめします：
      </p>

      <div className="space-y-3">
        {departments.map((department, index) => (
          <div
            key={department}
            className="flex items-center gap-3 bg-white rounded-lg p-4 border-2 border-gray-200"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
              {index + 1}
            </div>
            <div className="text-xl font-bold text-foreground">
              {department}
            </div>
          </div>
        ))}
      </div>

      {departments.length > 1 && (
        <div className="mt-6 p-4 bg-info/10 border border-info rounded-lg">
          <p className="text-gray-700">
            複数の診療科が候補に挙がる場合、まず<strong className="text-primary">1番目の診療科</strong>を受診するか、
            <strong className="text-primary">内科</strong>で相談することをおすすめします。
          </p>
        </div>
      )}

      {departments.includes('内科') && (
        <div className="mt-4 p-4 bg-success/10 border border-success rounded-lg">
          <p className="text-gray-700">
            💡 <strong>内科</strong>は幅広い症状に対応できます。
            どの診療科に行けばよいか迷った場合は、まず内科を受診してください。
          </p>
        </div>
      )}
    </div>
  );
}
