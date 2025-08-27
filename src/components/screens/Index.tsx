import { useState, useEffect } from 'react';
import { Head } from '~/components/shared/Head';
import { useFirestore } from '~/lib/firebase';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import JournalCard from '../shared/JournalCard';
import moment from 'moment';

export type Journal = {
  id: string,
  entry: string,
  date: Timestamp
}

export enum InputEnum {
  Id = 'id',
  Date = 'date',
  Entry = 'entry',
}

function Index() {
  const [journals, setJournals] = useState<Array<Journal>>([]);
  const firestore = useFirestore();
  const [inputData, setInputData] = useState<Partial<Journal>>({
    date: Timestamp.now(),
    entry: ''
  });
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      const journalsCollection = collection(firestore, "journals");
      const journalsQuery = query(journalsCollection);
      const querySnapshot = await getDocs(journalsQuery);
      const fetchedData: Array<Journal> = [];
      querySnapshot.forEach(doc => {
        fetchedData.push({ id: doc.id, ...doc.data() } as Journal);
      })
      setJournals(fetchedData);
    }
    fetchData();
  }, []);

  const onUpdateJournal = (id: string, data: Partial<Journal>) => {
    const docRef = doc(firestore, "journals", id)

    updateDoc(docRef, data).then(docRef => {
      toast.success('🦄 Updated the entry successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    }).catch(error => {
      setError(true);
    })
  }

  const onDeleteJournal = (id: string) => {
    const docRef = doc(firestore, "journals", id)

    deleteDoc(docRef).then(docRef => {
      toast.success('🦄 Deleted the entry successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      const removed = journals.filter(journal => journal.id !== id)
      setJournals(removed);
    }).catch(error => {
      setError(true);
    })
  }

  const handleInputChange = (field: InputEnum, value: string) => {
    setInputData({ ...inputData, [field]: value })
  }

  const handleDateChange = (field: InputEnum, value: string) => {
    let date = new Date(value)
    setInputData({ ...inputData, [field]: value ? Timestamp.fromDate(new Date(date.setDate(date.getDate() + 1))) : null })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const journalsCollection = collection(firestore, "journals");
      
      const newJournal: Partial<Journal> = {
        date: inputData.date,
        entry: inputData.entry,
      }
      const docRef = await addDoc(journalsCollection, newJournal);

      toast.success('🦄 Saved the entry successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setJournals([...journals, {
        id: docRef.id,
        date: newJournal.date || Timestamp.now(),
        entry: newJournal.entry || ''
      }]);
      setInputData({
        date: Timestamp.now(),
        entry: '',
      })
    } catch (error) {
      setError(true);
    }
  }

  const formatDate = (date: Timestamp) => {
    const dateArray = date.toDate().toLocaleDateString().split('/')
    const formattedDate = [dateArray[2], Number(dateArray[0]) < 10 ? '0' + dateArray[0] : dateArray[0], Number(dateArray[1]) < 10 ? '0' + dateArray[1] : dateArray[1]]
    return formattedDate.join('-')
  }

  return (
    <>
      <Head title="Surf Journal" />
      <div className="hero min-h-screen bg-slate-800">
        <div className="mac-w-5xl mx-auto">
          <form className="flex" onSubmit={handleSubmit}>
            <input
              type="date"
              onChange={e => handleDateChange(InputEnum.Date, e.target.value)}
              value={inputData.date ? formatDate(inputData.date) : ''}
              placeholder="date"
              className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"
            />
            <input
              type="text"
              onChange={e => handleInputChange(InputEnum.Entry, e.target.value)}
              value={inputData.entry}
              placeholder="How was your session?"
              className="m-4 text-slate-50 bg-transparent border border-slate-700 focus:ring-slate-400 focus:outline-none p-4 rounded-lg"
            />
            <button type="submit" className="m-4 border border-blue-500 p-5 rounded-lg transition-opacity bg-blue-600 bg-opacity-30 hover:bg-opacity-50 text-slate-50">Add</button>
          </form>
          <div className="grid grid-cols-2 gap-4 w-full bg-transparent text-slate-50">
            {
              journals.map(journal => (
                <JournalCard key={journal.id} journal={journal} onUpdate={onUpdateJournal} onDelete={onDeleteJournal} />
              ))
            }
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default Index;
