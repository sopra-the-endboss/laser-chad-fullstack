import React, {useEffect, useState} from 'react';
import {
    Typography,
    TextField,
    Button,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    InputLabel,
    FormControl,
    TextareaAutosize,
    IconButton, MenuItem, Autocomplete, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryMock from '../../data/CategoryMock.json';
import AllCompaniesMock from '../../data/AllCompanyMock.json';
import CustomModal from "../ui/CustomModal";

const SellProduct = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [category, setCategory] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [technicalData, setTechnicalData] = useState([{'spec': '', 'value': ''}]);
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [price, setPrice] = useState('');
    const [name, setName] = useState('');

    // Handlers for each input
    // Add similar handlers for other state variables as needed


    // fetch all category data
    useEffect(() => {
        setCategory(CategoryMock);
        setCompanies(AllCompaniesMock);
    }, []);


    const handleTechnicalDataChange = (index, field, value) => {
        const newData = [...technicalData];
        newData[index][field] = value;
        setTechnicalData(newData);
    };

    const handleAddTechnicalDataRow = () => {
        setTechnicalData([...technicalData, {'spec': '', 'value': ''}]);
    };

    const handleRemoveTechnicalDataRow = (index) => {
        const newData = [...technicalData];
        newData.splice(index, 1);
        setTechnicalData(newData);
    };


    const handleRemoveImage = (index) => {
        const newData = [...images];
        newData.splice(index, 1);
        setImages(newData);
    };

    // Function to handle image file selection
    const handleImageChange = (event) => {
        setImages([...event.target.files]);
    };

    return (
        <CustomModal openModalText={"Add new Product"}>
            <Stack spacing={3}>
                <Typography variant="h6" component="div">
                    Sell a Product
                </Typography>
                {/* Add inputs for price, name, and producer similar to the above examples */}

                <TextField
                    value={name}
                    placeholder={"Product Name"}
                    onChange={e => setName(e.target.value)}
                    fullWidth
                />

                <TextField
                    type={"number"}
                    value={price}
                    placeholder={"Price"}
                    onChange={e => setPrice(e.target.value)}
                    fullWidth
                />

                <Autocomplete
                    disablePortal
                    id="company_autocomplete"
                    options={companies.map(company => company.name) || []}
                    freeSolo
                    renderInput={(params) => <TextField
                        {...params}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        fullWidth
                        placeholder={"Producer"}
                    />}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                        labelId="category-label"
                        id="category-select"
                        value={selectedCategory}
                        label="Category"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {category?.map((cat, index) => <MenuItem key={index}
                                                                 value={cat.name}>{cat.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <Typography variant="body1" component="div" marginTop={2}>
                    Technical Data
                </Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{width: '45%'}}>Spec</TableCell>
                            <TableCell sx={{width: '45%'}}>Value</TableCell>
                            <TableCell sx={{width: '10%'}}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {technicalData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{width: '45%'}}>
                                    <Autocomplete
                                        disablePortal
                                        id="spec_autocomplete"
                                        options={category.find(cat => cat.name === selectedCategory)?.options || []}
                                        freeSolo
                                        renderInput={(params) => <TextField
                                            {...params}
                                            onChange={(e) => handleTechnicalDataChange(index, 'spec', e.target.value)}
                                            fullWidth
                                        />}
                                    />
                                </TableCell>
                                <TableCell sx={{width: '45%'}}>
                                    <TextField
                                        value={row.value}
                                        fullWidth
                                        onChange={(e) => handleTechnicalDataChange(index, 'value', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell sx={{width: '10%'}}>
                                    <IconButton aria-label="delete" size="large"
                                                onClick={() => handleRemoveTechnicalDataRow(index)}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={3}>
                                <Button onClick={handleAddTechnicalDataRow}>Add Row</Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <TextareaAutosize
                    aria-label="description"
                    placeholder="Description"
                    style={{width: '100%', marginTop: '20px'}}
                    minRows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                {/* Image upload logic */}
                <Button variant="contained" component="label" sx={{mt: 2}}>
                    Upload Images
                    <input type="file" hidden multiple onChange={handleImageChange}/>
                </Button>
                {images.length > 0 && (

                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{width: '90%'}}>File</TableCell>
                                <TableCell sx={{width: '10%'}}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {images.map((image, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {image.name}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton aria-label="delete" size="large"
                                                    onClick={() => handleRemoveImage(index)}>
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <Button variant="contained" component="label" sx={{mt: 2}}>Preview</Button>
            </Stack>
        </CustomModal>
    );
};

export default SellProduct;
