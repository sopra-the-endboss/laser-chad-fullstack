import axios from 'axios';
import { getDomain } from './getDomain';
import {enqueueSnackbar} from "notistack";

export const api = axios.create({
    baseURL: getDomain(),
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
});

export const handleError = ({error, message}) => {
    console.log(error)
    const response = error?.response;

    // catch 4xx and 5xx status codes
    if (response && !!`${response?.status}`.match(/^[4|5]\d{2}$/)) {
        let info = `\nrequest to: ${response?.request?.responseURL}`;

        if (response?.data?.status) {
            info += `\nstatus code: ${response?.data?.status}`;
            info += `\nerror message: ${response?.data?.detail}`;
        } else {
            info += `\nstatus code: ${response?.status}`;
            info += `\nerror message:\n${response?.data}`;
        }

        enqueueSnackbar(
            {
                message: message || "The request was made and answered but was unsuccessful.",
                variant: 'error',
                style: { width: '900px' },
                anchorOrigin: {vertical: 'top', horizontal: 'center'}
            }
        );
        console.log('The request was made and answered but was unsuccessful.', error?.response);
        return info;
    } else {
        if (error?.message.match(/Network Error/)) {
            enqueueSnackbar(
                {
                    message: "The server cannot be reached.",
                    variant: 'error',
                    style: { width: '900px' },
                    anchorOrigin: {vertical: 'top', horizontal: 'center'}
                }
            );
        } else {
            enqueueSnackbar(
                {
                    message: "There was an issue with the connection",
                    variant: 'error',
                    style: { width: '900px' },
                    anchorOrigin: {vertical: 'top', horizontal: 'center'}
                }
            );
        }
        return error?.message;
    }
};
