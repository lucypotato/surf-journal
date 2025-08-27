import { useState } from "react";
import { Journal, InputEnum } from "../screens/Index";
import { PencilSquareIcon, CheckIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { Timestamp } from "firebase/firestore";

interface JournalCardProps {
  journal: Journal,
  onUpdate: (id: string, data: Partial<Journal>) => void,
  onDelete: (id: string) => void
}

const JournalCard = ({ journal, onUpdate, onDelete }: JournalCardProps) => {
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [inputData, setInputData] = useState<Partial<Journal>>(journal);

  const toggleIsEdit = () => setIsEdit(prevIsEdit => !prevIsEdit)

  const onClose = () => {
    setIsEdit(false);
    setInputData(journal);
  }

  const handleInputChange = (field: InputEnum, value: string) => {
    setInputData({ ...inputData, [field]: value })
  }

  const handleDateChange = (field: InputEnum, value: string) => {
    setInputData({ ...inputData, [field]: value ? Timestamp.fromDate(new Date(value)) : null })
  }

  const handleUpdate = () => {
    setIsEdit(false)
    onUpdate(journal.id, inputData)
  }

  const handleDelete = () => {
    setIsEdit(false)
    onDelete(journal.id)
  }

  const inputClasses = clsx(
    'bg-transparent',
    'border-0',
    'py-2',
    'px-4',
    'rounded-md'
  )

  return (
    <div key={journal.id} className="h-48 group relative rounded-md flex flex-col justify-between shadow-slate-900 shadow-md p-4 bg-gradient-to-r from-slate-800 to-slate-700">
      <input className={clsx(inputClasses,
        "text-xl mb-2 font-bold text-slate-50",
        {
        'bg-gray-900': isEdit,
        'cursor-text': isEdit
        })}
        value={inputData.date ? inputData.date.toDate().toLocaleDateString() : ''}
        onChange={e => handleDateChange(InputEnum.Date, e.target.value)}
      />
      <input className={clsx(inputClasses,
        "text-slate-400",
        {
        'bg-gray-900': isEdit,
        'cursor-text': isEdit
        })}
        value={inputData.entry}
        onChange={e => handleInputChange(InputEnum.Entry, e.target.value)}
      />
      {
        isEdit ? 
          <>
            <CheckIcon onClick={handleUpdate} className="size-6 text-green-500 absolute top-4 right-12 cursor-pointer" />
            <XCircleIcon onClick={onClose} className="size-6 text-red-900 absolute top-4 right-4 cursor-pointer" />
            <TrashIcon onClick={handleDelete} className="size-6 text-slate-50 cursor-pointer" />
          </> : 
          <button className="btn btn-active btn-ghost hidden group-hover:block absolute top-4 right-4 p-0" onClick={toggleIsEdit}>
            <PencilSquareIcon className="size-6 text-slate-50 cursor-pointer" />
          </button>
      }
    </div>
  )
}

export default JournalCard