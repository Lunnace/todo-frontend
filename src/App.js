import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Paper, Checkbox } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { differenceInCalendarDays } from 'date-fns';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [deadline, setDeadline] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);

  useEffect(() => {
    fetch('https://todo-backend-x6ue.onrender.com/tasks')
      .then(res => res.json())
      .then(data => setTasks(data.filter(task => !task.done)));
  }, []);

  const handleAddTask = () => {
    fetch('https://todo-backend-x6ue.onrender.com/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        start_date: startDate.toISOString().split('T')[0],
        deadline: deadline.toISOString().split('T')[0],
        done: false
      })
    })
      .then(res => res.json())
      .then(task => setTasks([...tasks, task]));
  };

  const handleTaskDone = (idx) => {
    fetch(`https://todo-backend-x6ue.onrender.com/tasks/${idx}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => {
        setLastDeleted({ task: tasks[idx], idx });
        setTasks(tasks => tasks.filter((_, i) => i !== idx));
      });
  };

  const handleUndo = () => {
    if (!lastDeleted) return;
    fetch('https://todo-backend-x6ue.onrender.com/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lastDeleted.task)
    })
      .then(res => res.json())
      .then(task => {
        setTasks(tasks => {
          const newTasks = [...tasks];
          newTasks.splice(lastDeleted.idx, 0, task);
          return newTasks;
        });
        setLastDeleted(null);
      });
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      <Paper style={{ padding: 20 }}>
        <h2 className="todo-title">Todo List</h2>
        <TextField
          label="Task"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
          />
          <DatePicker
            label="Deadline"
            value={deadline}
            onChange={setDeadline}
            renderInput={(params) => <TextField {...params} margin="normal" fullWidth />}
          />
        </LocalizationProvider>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTask}
            disabled={!description || !startDate || !deadline}
          >
            Add Task
          </Button>
          {lastDeleted && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUndo}
            >
              Undo Delete
            </Button>
          )}
        </div>
        <Table style={{ marginTop: 30 }}>
          <TableHead>
            <TableRow>
              <TableCell>Done</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Deadline</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task, idx) => {
              const today = new Date();
              const deadlineDate = new Date(task.deadline);
              const daysLeft = differenceInCalendarDays(deadlineDate, today);
              let deadlineColor = '#d0f5df'; // pastel green default
              if (daysLeft < 2) deadlineColor = '#ffd6d6'; // pastel red
              else if (daysLeft <= 5) deadlineColor = '#ffe5b4'; // pastel orange
              return (
                <TableRow key={idx}>
                  <TableCell>
                    <Checkbox color="primary" onChange={() => handleTaskDone(idx)} />
                  </TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.start_date}</TableCell>
                  <TableCell style={{ backgroundColor: deadlineColor }}>
                    {task.deadline}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
      <div className="creator-credit">by lunace</div>
    </Container>
  );
}

export default App;
