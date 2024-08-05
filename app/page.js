'use client';

import React, { useState, useEffect } from 'react';
import { firestore } from '@/firebase';  // Update this import path as needed
import {
  Box,
  Button,
  Modal,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';

const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' },
    secondary: { main: '#81C784' },
    background: { default: '#E8F5E9' },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h3: {
      fontFamily: '"Brush Script MT", cursive',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Comic Sans MS", cursive',
      fontWeight: 700,
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemExpiration, setItemExpiration] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [itemToDeleteAll, setItemToDeleteAll] = useState('');

  const updateInventory = async () => {
    try {
      const q = query(collection(firestore, 'inventory'));
      const querySnapshot = await getDocs(q);
      const inventoryList = querySnapshot.docs.map((doc) => ({
        name: doc.id,
        ...doc.data(),
      }));
      setInventory(inventoryList);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const addItem = async (item, expiration) => {
    try {
      const docRef = doc(firestore, 'inventory', item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1, expiration }, { merge: true });
      } else {
        await setDoc(docRef, { quantity: 1, expiration });
      }
      await updateInventory();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeOneItem = async (item) => {
    try {
      const docRef = doc(firestore, 'inventory', item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity - 1 <= 0) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const removeAllItems = async (item) => {
    try {
      const docRef = doc(firestore, 'inventory', item);
      await deleteDoc(docRef);
      await updateInventory();
    } catch (error) {
      console.error('Error removing all items:', error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenDeleteAllDialog = (item) => {
    setItemToDeleteAll(item);
    setDeleteAllDialogOpen(true);
  };

  const handleCloseDeleteAllDialog = (confirm) => {
    if (confirm) {
      removeAllItems(itemToDeleteAll);
    }
    setDeleteAllDialogOpen(false);
  };

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const filteredInventory = inventory
    .filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()))
    .sort((a, b) => {
      if (filterOption === 'nameAsc') return a.name.localeCompare(b.name);
      if (filterOption === 'nameDesc') return b.name.localeCompare(a.name);
      if (filterOption === 'quantityAsc') return a.quantity - b.quantity;
      if (filterOption === 'quantityDesc') return b.quantity - a.quantity;
      if (filterOption === 'expirationAsc') return new Date(a.expiration) - new Date(b.expiration);
      if (filterOption === 'expirationDesc') return new Date(b.expiration) - new Date(a.expiration);
      return 0;
    });

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={2}
        gap={2}
        bgcolor="background.default"
      >
        <Typography
          variant="h3"
          color="#556B2F"
          align="center"
          width="100%"
          paddingY={2}
          sx={{ fontWeight: 'bold' }}
        >
          Pantry Tracker
        </Typography>

        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #4CAF50"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{ transform: 'translate(-50%, -50%)' }}
          >
            <Typography variant="h6">Add Item</Typography>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              label="Expiration Date"
              type="date"
              variant="outlined"
              fullWidth
              value={itemExpiration}
              onChange={(e) => setItemExpiration(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, itemExpiration);
                setItemName('');
                setItemExpiration('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Box>
        </Modal>

        <Dialog open={deleteAllDialogOpen} onClose={() => handleCloseDeleteAllDialog(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete all {itemToDeleteAll}?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleCloseDeleteAllDialog(true)} color="primary">
              Yes
            </Button>
            <Button onClick={() => handleCloseDeleteAllDialog(false)} color="secondary">
              No
            </Button>
          </DialogActions>
        </Dialog>

        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Add New Item
          </Button>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              label="Filter"
              startAdornment={<FilterListIcon />}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="nameAsc">Name Ascending</MenuItem>
              <MenuItem value="nameDesc">Name Descending</MenuItem>
              <MenuItem value="quantityAsc">Quantity Ascending</MenuItem>
              <MenuItem value="quantityDesc">Quantity Descending</MenuItem>
              <MenuItem value="expirationAsc">Expiration Ascending</MenuItem>
              <MenuItem value="expirationDesc">Expiration Descending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            variant="outlined"
            placeholder="Search"
            value={searchText}
            onChange={handleSearch}
            InputProps={{ startAdornment: <SearchIcon /> }}
          />
        </Box>

        <Box width="800px" border="1px solid #4CAF50" borderRadius={2} p={2} mt={2} bgcolor="white">
          <Box bgcolor="#556B2F" p={2} borderRadius={2} mb={2}>
            <Typography variant="h4" color="white" textAlign="center">
              Inventory
            </Typography>
          </Box>
          <Stack spacing={2} maxHeight="300px" overflow="auto">
            {filteredInventory.map(({ name, quantity, expiration }) => (
              <Box
                key={name}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#E8F5E9"
                p={2}
                borderRadius={1}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 3, overflow: 'hidden' }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Verdana, sans-serif', mr: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Expires: {expiration}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>Quantity: {quantity}</Typography>
                <Box display="flex" gap={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={() => addItem(name, expiration)}
                    sx={{ minWidth: 0, padding: 1 }}
                  >
                    <AddIcon />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => removeOneItem(name)}
                    sx={{ minWidth: 0, padding: 1 }}
                  >
                    <RemoveIcon />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDeleteAllDialog(name)}
                    sx={{ minWidth: 0, padding: 1 }}
                  >
                    <DeleteIcon />
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}