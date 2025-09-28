"use client";

export default function ContactForm() {

  return (
    <div className="form-container">
        <form action="" method="post">
        <div className="from-group mb-3">
            <input type="text" name="name" className="form-control" id="" placeholder="Your Name" />
        </div>
        <div className="from-group mb-3">
            <input type="email" name="email" className="form-control" id="" placeholder="Your Email"/>
        </div>
        <div className="from-group mb-3">
            <div className="mb-3">
                <textarea className="form-control" name="" id="" rows={4} placeholder="Message"></textarea>
            </div>
        </div>

        <button type="submit" className="btn btn-wide btn-brand-green px-4">Submit</button>

        </form>
    </div>
  );
}