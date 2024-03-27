import React, { useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { Dna } from "react-loader-spinner";
import "./App.css";

type TransodedData = {
  url: string,
  quality: string,
}
type UserVideoData = {
  id: string,
  s3Url: string,
  fileType: string
}
function App() {
  const [file, setFile] = useState<any>();
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [transcodedVideosData, setTranscodedVideosData] = useState<TransodedData[]>([]);

  const handleSubmit = async () => {
    if (!fileUploaded || !file) return;
    //get secure url from server
    setLoading(true);
    const response = await axios.get('http://localhost:3000/s3url');
    const url: string = response.data.url;

    //upload video to s3
    const contentType: string = 'video/' + file.name.split('.').pop();
    console.log(contentType);
    await axios.put(url, file, {
      headers: {
        "content-Type": contentType,
      }
    });
    const s3Url: string = url.split('?')[0];
    console.log(s3Url);


    //send the url to transcoder with other metadata as well
    //transcode videos and get all the 

    try {
      setLoading(true);
      const data: UserVideoData = {
        id: uuidv4(),
        s3Url,
        fileType: file.name.split('.').pop(),
      }
      const transcodedVideo = await axios.post(
        "http://localhost:3000/transcodeVideo",
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log(transcodedVideo);
      console.log(transcodedVideo.data);
      setTranscodedVideosData(transcodedVideo.data.urls)
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
    setLoading(false);
  };

  const fileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    const fileSize :number = selectedFile.size / (1024 * 1024);
    const maxFileSize : number = 25;
    if (fileSize <= maxFileSize) {
      console.log("File is within the size limit.");
      console.log(e.target.files[0].name);
      setFile(e.target.files[0]);
      setFileUploaded(true);
    } else {
      alert("File size exceeds the limit of 25 MB.");
      e.target.value = null;
    }
  };

  return (
    <>
      <div className="h-screen">
        {loading && (
          <div className="h-screen w-screen absolute z-10 bg-[#0D1B2A] opacity-50 flex">
            <div className="flex mx-auto mt-[530px] flex-col">
              <Dna
                visible={true}
                height="180"
                width="180"
                ariaLabel="dna-loading"
                wrapperStyle={{}}
                wrapperClass="dna-wrapper"
              />
            </div>
          </div>
        )}
        <div
          className="bg-[#0D1B2A]
        flex py-4 justify-items-center align-middle"
        >
          <p className="text-center self-center flex px-4 font-['Pacifico'] text-3xl text-[#E0E1DD]">
            Transcode It
          </p>
        </div>
        <div className="bg-[#1B263B] h-full text-[#E0E1DD] font-['Poppins'] text-center text-xl">
          <div className="pt-40 pb-10">
            Upload a video file and get it in multiple resolutions!
          </div>
          <div className="justify-center flex">
            <div className="flex justify-center items-center">
              <input
                type="file"
                accept="video/*"
                className="w-72"
                onChange={fileChange}
              />
            </div>
          </div>
          <div className="flex justify-center my-12">
            <div
              className="flex p-3 rounded-lg bg-[#E0E1DD]  text-[#1B263B] font-bold"
              onClick={handleSubmit}
            >
              Submit
            </div>
          </div>
          <div className="overflow-auto h-72 border border-white mx-4 rounded-lg">
            <div className="flex flex-wrap justify-center">
              {transcodedVideosData.map((videoData, index) => (
                <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                  <p className="text-center mt-2 text-sm font-semibold">
                    Quality: {videoData.quality}
                  </p>
                  <a
                    href={videoData.url}
                    download={`${videoData.quality}.mp4`} // Specify the download filename
                    className="block mt-2 text-center text-sm text-blue-500 hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
