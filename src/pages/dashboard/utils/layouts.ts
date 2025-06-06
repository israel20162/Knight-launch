import { useAppContext } from "../../../context/AppContext";
import type { layoutType } from "../../../types";

const { device } = useAppContext();

const currentDeviceImg = device.imageUrl;

export const layouts: layoutType[] = [
    {
        id: 1,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: 50,
            top: 2,
            scaleX: 1,
            scaleY: 1,
        },
    },
    {
        id: 2,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: 90,
            top: 70,
            scaleX: 1,
            scaleY: 1,
        },
    },
    {
        id: 3,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: 95,
            top: 90,
            scaleX: 1,
            scaleY: 1,
            angle: 45,
        },
    },
    {
        id: 4,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: -5,
            top: 85,
            scaleX: 1,
            scaleY: 1,
            angle: 45,
        },
    },
    {
        id: 5,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: 50,
            top: 75,
            scaleX: 1,
            scaleY: 1,
            angle: 30,
        },
    },
    {
        id: 6,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: 50,
            top: 75,
            scaleX: 1,
            scaleY: 1,
            angle: -30,
        },
    },
    {
        id: 7,
        text: {
            value: "Insert your text here",
            left: 0,
            top: 3,
            originX: "center",
            fontSize: 7,
            fill: "#FFFFFF",
        },
        frame: {
            url: currentDeviceImg,
            originX: "center",
            originY: "center",
            left: -10,
            top: 70,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
        },
    },
];