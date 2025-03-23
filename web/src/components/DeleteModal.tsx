
interface DeleteConfirmationModalProps {
 deleteHandler: () => void;
 isModalOpen: boolean;
 setIsModalOpen: any;
}

export function DeleteModal({deleteHandler, isModalOpen, setIsModalOpen}: DeleteConfirmationModalProps) {
//   if (!isOpen) return null;
    const onClickHandler = () => {
        deleteHandler()
        setIsModalOpen(!isModalOpen)
    }

  return (
    <div>
        {isModalOpen && <div className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
        <p className="mb-6">
          Are you sure you want to delete this post? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            // onClick={onClose}
            onClick={() => setIsModalOpen(!isModalOpen)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            // onClick={onConfirm}
            onClick={onClickHandler}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700`}
            // disabled={isDeleting}
          >
            {/* {isDeleting ? (
              <div className="px-2 flex items-center">
                <Loader className="animate-spin size-4 mr-2" />
                Deleting...
              </div>
            ) : (
              "Delete"
            )} */}
            Delete
          </button>
        </div>
      </div>
    </div>}
    </div>
  );
}