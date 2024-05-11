import {
    Autocomplete, Button,
    FormControl, IconButton,
    InputLabel,
    MenuItem,
    Select, Stack,
    Table, TableBody, TableCell,
    TableHead, TableRow, TextareaAutosize,
    TextField,
    Typography
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import React, {useEffect, useState} from "react";
//import CategoryMock from "../../data/CategoryMock.json";
//import AllCompaniesMock from "../../data/AllCompanyMock.json";
import {useFetchCategories, useFetchDistributor} from "../../utils/apiCalls";
import {enqueueSnackbar} from "notistack";

const ProductContent = ({
        collectedData,
        setCollectedData,
        setActiveStep,
    }) => {

    // This function transforms the technical details object into the array format
    const prepareInitialTechnicalData = (technicalDetails) => {
        return Object.entries(technicalDetails || {}).map(([spec, value]) => ({
            spec,
            value
        }));
    };

    // Preparing initial state before using it in useState
    const initialTechnicalData = prepareInitialTechnicalData(collectedData.technical_details);


    const [selectedCategory, setSelectedCategory] = useState(collectedData.category || '');
    const [selectedCompany, setSelectedCompany] = useState(collectedData.brand || '');
    const [category, setCategory] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [technicalData, setTechnicalData] = useState(initialTechnicalData);
    const [description, setDescription] = useState(collectedData.description || '');
    const [images, setImages] = useState(collectedData.images || []);
    const [price, setPrice] = useState(collectedData.price || '');
    const [name, setName] = useState(collectedData.product || '');

    const [warranty, setWarranty] = useState(collectedData.warranty || '');
    const [availability, setAvailability] = useState(collectedData.availability || '');
    const [subheader, setSubheader] = useState(collectedData.subheader || '');

    const fetchDistributor = useFetchDistributor(setCompanies);
    const fetchCategories = useFetchCategories(setCategory);


    // fetch all category data
    useEffect(() => {
        fetchDistributor();
        fetchCategories();
        //setCategory(CategoryMock);
        //setCompanies(AllCompaniesMock);
        // again same issue as in App.js if we added hooks as dependencies we would be f***ed
        // eslint-disable-next-line
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
        const files = Array.from(event.target.files); // Convert FileList to Array
        const imagePreviews = files.map(file => ({
            name: file.name,
            preview: URL.createObjectURL(file),
            file: file, // Keep the File object for upload
        }));
        // Set images with previews for carousel display and file references for upload
        setImages(imagePreviews);
    };

    const transformDataForProductDetail = () => {

        // Transforming technicalData array to an object expected by ProductDetail
        const technical_details = technicalData.reduce((details, item) => {
            if (item.spec && item.value) {
                details[item.spec] = item.value;
            }
            return details;
        }, {});

        const transformedImages = images.map(image => image?.preview || image);


        // Construct the transformed object
        const transformedData = {
            product_id: Math.random().toString(36).substr(2, 9), // Generating a pseudo-unique ID
            product: name,
            subheader: subheader,
            warranty: warranty,
            description,
            price: Number(price),
            category: selectedCategory,
            brand: selectedCompany,
            technical_details,
            images: transformedImages,
            availability: availability,
        };

        return transformedData;
    }

    const isNonEmptyString = (str) => (typeof str === 'string' || typeof str === 'number') && str.trim() !== '';
    const [categoryError, setCategoryError] = useState(false);
    const [companyError, setCompanyError] = useState(false);
    const [priceError, setPriceError] = useState(false);
    const [nameError, setNameError] = useState(false);
    const [warrantyError, setWarrantyError] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(false);

    const handleStep = () => {
        // check if all entries are valid
        // then do:

        setNameError(!isNonEmptyString(name));
        setPriceError(!isNonEmptyString(price));
        setCategoryError(!isNonEmptyString(selectedCategory));
        setCompanyError(!isNonEmptyString(selectedCompany));
        setWarrantyError(!isNonEmptyString(warranty));
        setAvailabilityError(!isNonEmptyString(availability));

        const correctValidation = [!isNonEmptyString(name), !isNonEmptyString(price), !isNonEmptyString(selectedCategory), !isNonEmptyString(selectedCompany), !isNonEmptyString(warranty), !isNonEmptyString(availability)].every(x => !x);

        if(correctValidation){
            const transformedData = transformDataForProductDetail();
            setCollectedData(transformedData);
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } else {
            // queue notification that shows you're supposed to fill in all fields
            const missing = (!isNonEmptyString(name) ? 'name, ' : '')
            + (!isNonEmptyString(price) ? 'price, ' : '')
            + (!isNonEmptyString(selectedCategory) ? 'category, ' : '')
            + (!isNonEmptyString(selectedCompany) ? 'company, ' : '')
            + (!isNonEmptyString(warranty) ? 'warranty, ' : '')
            + (!isNonEmptyString(availability) ? 'availability ' : '')

            enqueueSnackbar(
                {
                    message: "Fill in all the mandatory fields. Currently missing: " + missing,
                    variant: 'error',
                    style: { width: '900px' },
                    anchorOrigin: {vertical: 'top', horizontal: 'center'},
                    autoHideDuration: 3000
                }
            );
        }
    }

    return (
        <Stack spacing={3}>
            <Typography variant="h6" component="div">
                Sell a Product
            </Typography>

            <TextField
                value={name}
                placeholder={"Product Name"}
                onChange={e => setName(e.target.value)}
                fullWidth
                error={nameError}
            />

            <TextField
                type={"number"}
                value={price}
                placeholder={"Price"}
                onChange={e => setPrice(e.target.value)}
                fullWidth
                error={priceError}
            />

            <Autocomplete
                disablePortal
                id={`company_autocomplete`} // Ensure unique IDs for each instance
                options={companies.map(company => company.name) || []}
                freeSolo
                value={selectedCompany}
                onChange={(event, newValue) => {
                    setSelectedCompany(newValue);
                }}

                renderInput={(params) => (
                    <TextField
                        {...params}
                        value={selectedCompany}
                        onChange={(e) => {
                            setSelectedCompany(e.target.value);
                        }}
                        fullWidth
                        placeholder={"Producer"}

                        error={companyError}
                    />
                )}
            />

            <TextField
                value={subheader}
                placeholder={"Subheader"}
                onChange={e => setSubheader(e.target.value)}
                fullWidth
            />


            <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    id="category-select"
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    error={categoryError}
                >
                    {category?.map((cat, index) => <MenuItem key={index}
                                                             value={cat.name} >{cat.name}</MenuItem>)}
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
                                    id={`spec_autocomplete_${index}`} // Ensure unique IDs for each instance
                                    options={category.find(cat => cat.name === selectedCategory)?.options || []}
                                    freeSolo
                                    value={technicalData[index].spec}
                                    onChange={(event, newValue) => {
                                        handleTechnicalDataChange(index, 'spec', newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            value={technicalData[index].spec}
                                            onChange={(e) => {
                                                handleTechnicalDataChange(index, 'spec', e.target.value)
                                            }}
                                        />
                                    )}
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

            <Autocomplete
                disablePortal
                id={`company_warranty`} // Ensure unique IDs for each instance
                options={['None', '1 year', '2 years', '5 years']}
                freeSolo
                value={warranty}
                onChange={(event, newValue) => {
                    setWarranty(newValue);
                }}

                renderInput={(params) => (
                    <TextField
                        {...params}
                        value={warranty}
                        onChange={(e) => {
                            setWarranty(e.target.value)
                        }}
                        fullWidth
                        placeholder={"Warranty for this product"}
                        error={warrantyError}
                    />
                )}
            />

            <Autocomplete
                disablePortal
                id={`company_instock`} // Ensure unique IDs for each instance
                options={['In stock', 'Available within 1-3 weeks', 'Not available', 'Out of stock']}
                freeSolo
                value={availability}
                onChange={(event, newValue) => {
                    setAvailability(newValue);
                }}

                renderInput={(params) => (
                    <TextField
                        {...params}
                        value={availability}
                        onChange={(e) => {
                            setAvailability(e.target.value)
                        }}
                        fullWidth
                        placeholder={"Availability"}
                        error={availabilityError}
                    />
                )}
            />

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
                                    <span style={{lineBreak: "anywhere"}}>{image.name || image}</span>
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

            <Button variant="contained" component="label" sx={{mt: 2}} onClick={handleStep}>Preview</Button>
        </Stack>
    )
}; export default ProductContent;
