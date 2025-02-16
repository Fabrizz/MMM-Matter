
export default function DeviceGrid() {
  return (
    <div className="flex flex-col gap-4 m-auto lg:max-w-lg md:max-w-lg p-8">
      <div className="bg-orange-600 h-40"></div>
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-red-500 aspect-square"></div>
        <div className="bg-red-500 aspect-square"></div>
        <div className="bg-red-500 aspect-square"></div>
        <div className="bg-red-500 aspect-square"></div>
        <div className="bg-red-500 aspect-square"></div>
      </div>
    </div>
  );
}