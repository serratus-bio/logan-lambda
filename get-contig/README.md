# get-contig

A node.js module for AWS Lambda that retrieves individual contigs from the logan dataset.

## Input

* An SRA library id that will be used to fetch the resource https://logan-pub.s3.amazonaws.com/c/\<SRA\>/\<SRA\>.contigs.fa.zst.

* A list of contig ids that will be extracted from the file.

Both of these parameters should be provided as a JSON object that is passed to the HTTP request when the lambda function is called. The JSON object should look like:

```
{
  SRA:<SRA library id>,
  contig:[<contig id 1>, <contig id 2>, ...]
}
```

## Output

A FASTA sequence file with the corresponding contigs (if they exist)

## Deploying (through the AWS console)

* Create a lambda function, using the node.js 20+ runtime and an HTTPS endpoint with no auth.
* Copy the contents of index.mjs to its remote counterpart.
* Copy bin/zstd to its remote counterpart, make sure it ends up in the same location, relative to the index.mjs script.
* Clink on 'Deploy'.

## Examples (using curl)

*NOTE: A very trivial auth scheme is set in place, in order for the function to execute you have to provide the following header `"Authorization: Bearer 20240522"`.*

Three contigs (**DRR201391_22**, **DRR201391_23**, **DRR201391_24**) from one SRA library (**DRR201391**):
```
curl -H 'Authorization: Bearer 20240522' -H 'Content-Type: application/json' -X POST -d '{"SRA":"DRR201391","contig":["DRR201391_22","DRR201391_23","DRR201391_24"]}' https://ag63ar36qwfndxxfc32b3w57oy0wcugc.lambda-url.us-east-1.on.aws
```

If you only want one contig from one single library, you can use a simple GET request with the SRA and contig ids in the pathname:

```
curl -H 'Authorization: Bearer 20240522' https://ag63ar36qwfndxxfc32b3w57oy0wcugc.lambda-url.us-east-1.on.aws/DRR201391/DRR201391_22
```

#### Example Output

```
>DRR201391_22 ka:f:6.886   L:+:16830:+  L:-:1160:- L:-:2727:+ 
CGCTCCCTTTAAACCCAATATATCCGGATCACGCCCGGACCTTCCGTATTA
>DRR201391_23 ka:f:18.230   L:+:25565:+  L:-:2701:+ L:-:2702:+ 
ACGGAGGATCCGAGGGTTATCCGGATTTAGTGGGTTTAAA
>DRR201391_24 ka:f:12.892   L:+:47447:+  L:-:2703:+ L:-:2704:+ 
ACGGAGGATCCGAGAGTTATCCGGATTTAGTGGGTTTAAAGGG
```
