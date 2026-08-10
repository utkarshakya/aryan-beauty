import sendEmail from "../utils/sendEmail.js";

export const notificationSender = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    const response = await sendEmail(to, subject, text);
    if(!response){
      throw Error("Sorry, Something went wrong sending email");
    }
    res.status(201).json({ message: "Email Sended Successfully" });
  } catch (error) {
    res.status(501).json({ message: error.message });
  }
};
