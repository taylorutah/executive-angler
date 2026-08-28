import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-[var(--paper)]">
      <div className="desk-sheet">
        <div className="desk-form">
          <h1
            className="font-heading text-[32px] font-semibold leading-[36px] text-[var(--text-primary)] sm:text-[48px] sm:leading-[56px]"
            style={{ fontVariationSettings: '"SOFT" 0, "WONK" 1' }}
          >
            Reset your password
          </h1>
          <p className="desk-dek-ui mt-3">
            Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
