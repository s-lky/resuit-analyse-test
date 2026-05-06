// 前端只管发请求，不关心后端怎么算
export const uploadAudio = async (base64Data) => {
    return await axios.post('http://localhost:8080/api/interview/analyze', { audio: base64Data });
}