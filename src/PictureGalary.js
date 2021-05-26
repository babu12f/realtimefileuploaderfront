import axios from 'axios';
import React from 'react'

const ws = new WebSocket("ws://localhost:8080/spring4web/chatendpoint");
const MAIN_PIC_BASE_PATH = "http://localhost:8080/spring4web/static/img/";
const THUMB_PIC_BASE_PATH = "http://localhost:8080/spring4web/static/img/thumb_200_200_";

export default class PictureGalary extends React.Component {


    constructor(props) {
        super(props)

        this.state = {
            pictures: [],
            uploadFiles: null,
        }

        this.reloadPicture = this.reloadPicture.bind(this)
        ws.onmessage = (message) => {
            var msgJson = JSON.parse(message.data);
            if (msgJson.message != null) {
                this.reloadPicture(msgJson)
            }
        }
    }

    reloadPicture(msg) {
        axios.get("http://localhost:8080/spring4web/getfiles")
        .then((res)=> {
            console.log(res.data)
            this.setState({pictures: res.data})
        })
        .catch((e) => {
            console.log(e);
        })
    }

    componentDidMount() {
        this.reloadPicture("initial")
    }

    fileInputChang = (e) => {
        this.setState({
            uploadFiles: e.target.files
        })
        let files = e.target.files

        let formData = new FormData()
        for(let i = 0; i<files.length; i++) {
            formData.append("mypic", files[i])
        }

        let path = "http://localhost:8080/spring4web/file"
        axios({
            method: "POST",
            url: path,
            data: formData,
            headers: {"cntent-type": "multipart/form-data"},
        })
            .then(res=> {
                console.log(res)
            })
            .catch(e=> {
                console.log(e)
            })

        e.target.value = null;
    }

    formateDate(dateStr) {
        var d = (new Date(dateStr) + '').split(' ');
        d[2] = d[2] + ',';
    
        return [d[0], d[1], d[2], d[3]].join(' ');
    }

    fileSimpleName(fullname) {
        return fullname.substr(0, 10)
    }

    render() {
        return <>
            <div className="container">
                <div className="form-container">
                    <form>
                        <input type="file" onChange={this.fileInputChang} multiple="multiple" accept="image/*"/>
                    </form>
                </div>
                <div className="table-container">
                    <table cellPadding="10" cellSpacing="0" border="1">
                        <thead>
                            <tr>
                                <th>Image name</th>
                                <th>Upload Date</th>
                                <th>Image</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.pictures.map((pic, index)=> (
                                    <tr key={pic.id}>
                                        <td>{this.fileSimpleName(pic.imagePath)}</td>
                                        <td>{this.formateDate(pic.createdDate)}</td>
                                        <td>
                                            <img src={THUMB_PIC_BASE_PATH + pic.imagePath}/>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    }
}
