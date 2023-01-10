function main() {
    navigator.clipboard.writeText(SHARED.getSchemaContent());
}

main();
RESULT_LOG.push("Copied to clipboard!");